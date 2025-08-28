import { Router } from "express";
import { bulkUpsertOpportunities, listOpportunities,listInternship } from "../controllers/opportunity.controller.js";
import { publicCache } from "../middlewares/cache.middleware.js";

const router = Router();

function requireScraperToken(req, res, next) {
  const expected = (process.env.SCRAPER_TOKEN || "").trim();
  if (!expected) return res.status(403).json({ success: false, message: "SCRAPER_TOKEN not configured" });
  const provided = (req.header("X-Internal-Token") || req.query.token || "").trim();
  if (provided !== expected) return res.status(401).json({ success: false, message: "Unauthorized" });
  return next();
}

router.get("/", publicCache(120), listOpportunities);
router.get("/internships", publicCache(120), listInternship);
router.post("/bulk", requireScraperToken, bulkUpsertOpportunities);

export default router;
