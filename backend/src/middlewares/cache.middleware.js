import { createHash } from "crypto";

class LruTtlCache {
  constructor(maxEntries = 500) {
    this.maxEntries = maxEntries;
    this.map = new Map();
  }

  _now() {
    return Date.now();
  }

  get(key) {
    const entry = this.map.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= this._now()) {
      this.map.delete(key);
      return null;
    }
    this.map.delete(key);
    this.map.set(key, entry);
    return entry;
  }

  set(key, value, ttlMs) {
    const expiresAt = this._now() + ttlMs;
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, { ...value, expiresAt });
    while (this.map.size > this.maxEntries) {
      const oldestKey = this.map.keys().next().value;
      this.map.delete(oldestKey);
    }
  }
}

const globalCache = new LruTtlCache(500);

function buildKey(req) {
  return `${req.method}:${req.originalUrl}`;
}

function computeETag(bodyBuffer) {
  const hash = createHash("sha1").update(bodyBuffer).digest("hex");
  return `"${hash}"`;
}

function cacheMiddleware({ ttlSeconds = 60, privacy = "public" } = {}) {
  const ttlMs = Math.max(1, ttlSeconds) * 1000;
  const cacheControl =
    privacy === "private"
      ? `private, max-age=${ttlSeconds}`
      : `public, max-age=${ttlSeconds}, s-maxage=${ttlSeconds}`;

  return function (req, res, next) {
    if (req.method !== "GET") return next();

    const key = buildKey(req);
    const cached = globalCache.get(key);
    if (cached) {
      if (
        req.headers["if-none-match"] &&
        req.headers["if-none-match"] === cached.etag
      ) {
        res.setHeader("ETag", cached.etag);
        res.setHeader("Cache-Control", cacheControl);
        return res.status(304).end();
      }
      res.setHeader(
        "Content-Type",
        cached.contentType || "application/json; charset=utf-8"
      );
      res.setHeader("ETag", cached.etag);
      res.setHeader("Cache-Control", cacheControl);
      return res.status(cached.statusCode || 200).send(cached.body);
    }

    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    function captureAndSend(body, sender) {
      try {
        let buffer;
        if (Buffer.isBuffer(body)) buffer = body;
        else if (typeof body === "string") buffer = Buffer.from(body);
        else buffer = Buffer.from(JSON.stringify(body));

        const etag = computeETag(buffer);

        if (
          req.headers["if-none-match"] &&
          req.headers["if-none-match"] === etag
        ) {
          res.setHeader("ETag", etag);
          res.setHeader("Cache-Control", cacheControl);
          return res.status(304).end();
        }

        res.setHeader("ETag", etag);
        res.setHeader("Cache-Control", cacheControl);

        const contentType = res.getHeader("Content-Type");
        const statusCode = res.statusCode;

        globalCache.set(
          key,
          { body: buffer, etag, contentType, statusCode },
          ttlMs
        );
      } catch (e) {}
      return sender(body);
    }

    res.json = (body) => captureAndSend(body, originalJson);
    res.send = (body) => captureAndSend(body, originalSend);

    next();
  };
}

export function publicCache(ttlSeconds = 60) {
  return cacheMiddleware({ ttlSeconds, privacy: "public" });
}

export function privateCache(ttlSeconds = 60) {
  return cacheMiddleware({ ttlSeconds, privacy: "private" });
}
