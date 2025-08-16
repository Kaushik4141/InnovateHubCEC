import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { User } from "./models/user.model.js";
import { Message } from "./models/message.model.js";


const userSockets = new Map(); 
const socketToUser = new Map();

function addUserSocket(userId, socketId) {
  if (!userSockets.has(userId)) userSockets.set(userId, new Set());
  userSockets.get(userId).add(socketId);
  socketToUser.set(socketId, userId);
}
function removeUserSocket(socketId) {
  const userId = socketToUser.get(socketId);
  if (!userId) return null;
  const set = userSockets.get(userId);
  if (set) {
    set.delete(socketId);
    if (set.size === 0) userSockets.delete(userId);
  }
  socketToUser.delete(socketId);
  return userId;
}
function getUserSockets(userId) {
  return Array.from(userSockets.get(userId) || []);
}
function isUserOnline(userId) {
  return userSockets.has(userId);
}

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      withCredentials: true,
      sameSite: 'None', 
    },
  });




  io.use(async (socket, next) => {
    try {
      let token = socket.handshake.auth?.token;

      if (!token) {
        const authHeader = socket.handshake.headers["authorization"]; 
        if (authHeader && authHeader.startsWith("Bearer ")) {
          token = authHeader.replace("Bearer ", "").trim();
        }
      }

      if (!token) {
        const rawCookie = socket.handshake.headers?.cookie;
        if (rawCookie) {
          const parsed = cookie.parse(rawCookie);
          token = parsed?.accessToken;
        }
      }

      if (!token) return next(new Error("Unauthorized: token missing"));

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded?._id).select("_id fullname avatar");
      if (!user) return next(new Error("Unauthorized: user not found"));

      socket.user = { _id: user._id.toString(), fullname: user.fullname, avatar: user.avatar };
      return next();
    } catch (err) {
      return next(new Error("Unauthorized: " + (err?.message || "invalid token")));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id;
    addUserSocket(userId, socket.id);
    io.emit("userOnline", { userId });
    socket.join(`user:${userId}`);

    socket.on("joinRoom", async ({ roomId }) => {
      if (!roomId) return;
      socket.join(roomId);
      socket.emit("joinedRoom", { roomId });
    });

    socket.on("leaveRoom", async ({ roomId }) => {
      if (!roomId) return;
      socket.leave(roomId);
      socket.emit("leftRoom", { roomId });
    });

    socket.on("roomMessage", async ({ roomId, content, type = "text", replyTo = null, clientId = null }) => {
      if (!roomId || !content) return;
      try {
        const doc = await Message.create({
          sender: userId,
          roomId,
          content,
          type,
          replyTo: replyTo || null,
        });
        let replyPayload = null;
        if (replyTo) {
          const ref = await Message.findById(replyTo).populate('sender', 'fullname avatar').select('content type sender createdAt');
          if (ref) {
            replyPayload = {
              _id: ref._id,
              content: ref.content,
              type: ref.type,
              sender: ref.sender,
              createdAt: ref.createdAt,
            };
          }
        }
        const payload = {
          _id: doc._id,
          sender: { _id: userId, fullname: socket.user.fullname, avatar: socket.user.avatar },
          roomId,
          content,
          type,
          createdAt: doc.createdAt,
          replyTo: replyPayload,
          clientId: clientId || null,
        };
        io.to(roomId).emit("roomMessage", payload);
      } catch (e) {
        socket.emit("error", { message: e?.message || "Failed to send room message" });
      }
    });

    socket.on("privateMessage", async ({ toUserId, content, type = "text", replyTo = null, clientId = null }) => {
      if (!toUserId || !content) return;
      try {
        const doc = await Message.create({
          sender: userId,
          receiverUser: toUserId,
          content,
          type,
          replyTo: replyTo || null,
        });
        let replyPayload = null;
        if (replyTo) {
          const ref = await Message.findById(replyTo).populate('sender', 'fullname avatar').select('content type sender createdAt');
          if (ref) {
            replyPayload = {
              _id: ref._id,
              content: ref.content,
              type: ref.type,
              sender: ref.sender,
              createdAt: ref.createdAt,
            };
          }
        }
        const payload = {
          _id: doc._id,
          sender: { _id: userId, fullname: socket.user.fullname, avatar: socket.user.avatar },
          receiverUser: toUserId,
          content,
          type,
          createdAt: doc.createdAt,
          replyTo: replyPayload,
          clientId: clientId || null,
        };
       
        const recipientSockets = getUserSockets(toUserId);
        if (recipientSockets.length) recipientSockets.forEach((sid) => io.to(sid).emit("privateMessage", payload));
        socket.emit("privateMessage", payload);
      } catch (e) {
        socket.emit("error", { message: e?.message || "Failed to send private message" });
      }
    });

   
    socket.on("userOnline", () => io.emit("userOnline", { userId }));
    socket.on("userOffline", () => io.emit("userOffline", { userId }));

    socket.on("disconnect", () => {
      const removedUserId = removeUserSocket(socket.id);
      if (removedUserId && !isUserOnline(removedUserId)) {
        io.emit("userOffline", { userId: removedUserId });
      }
    });
  });

  return io;
}

export const presenceStore = {
  isUserOnline,
  getUserSockets,
};
