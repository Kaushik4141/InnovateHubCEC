import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apierrorhandler.js";
import { ApiResponse } from "../utils/apiresponsehandler.js";
import { ChatRoom } from "../models/chatroom.model.js";
import { Message } from "../models/message.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { presenceStore, getIO, emitToUser } from "../socket.js";

export const ensureDefaultRooms = async () => {
  try {
    const count = await ChatRoom.countDocuments({ isPrivate: false });
    if (count === 0) {
      await ChatRoom.insertMany([
        { name: "General", isPrivate: false },
        { name: "Projects", isPrivate: false },
        { name: "Random", isPrivate: false },
      ]);
    }
  } catch (e) {
    throw new ApiError(500, "Failed to ensure default rooms", e.message);
  }
};

export const reactToMessage = asyncHandler(async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body || {};
    const userId = req.user._id.toString();
    if (!messageId) throw new ApiError(400, "messageId required");
    if (!emoji) throw new ApiError(400, "emoji required");

    const msg = await Message.findById(messageId);
    if (!msg) throw new ApiError(404, "Message not found");

    if (!msg.reactions) msg.reactions = new Map();
    const current = Array.isArray(msg.reactions.get(emoji)) ? msg.reactions.get(emoji) : [];
    const exists = current.map(String).includes(userId);
    const updated = exists ? current.filter((u) => String(u) !== userId) : [...current, userId];
    msg.reactions.set(emoji, updated);
    await msg.save();

    const payload = { _id: msg._id.toString(), reactions: Object.fromEntries(msg.reactions) };

    const io = getIO();
    if (msg.roomId) {
      io?.to(msg.roomId.toString()).emit("messageUpdated", payload);
    } else if (msg.receiverUser) {
      emitToUser(String(msg.receiverUser), "messageUpdated", payload);
      emitToUser(String(msg.sender), "messageUpdated", payload);
    }

    return res.status(200).json(new ApiResponse(200, payload, "Reaction updated"));
  } catch (e) {
    throw new ApiError(500, "Failed to react to message", e.message);
  }
});

export const pinMessage = asyncHandler(async (req, res) => {
  try {
    const { messageId } = req.params;
    if (!messageId) throw new ApiError(400, "messageId required");
    const msg = await Message.findById(messageId);
    if (!msg) throw new ApiError(404, "Message not found");

    let prevPinned = null;
    if (msg.roomId) {
      prevPinned = await Message.findOneAndUpdate({ roomId: msg.roomId, pinned: true, _id: { $ne: msg._id } }, { $set: { pinned: false } }, { new: true });
    } else if (msg.receiverUser) {
      const a = msg.sender;
      const b = msg.receiverUser;
      prevPinned = await Message.findOneAndUpdate({ pinned: true, $or: [ { sender: a, receiverUser: b }, { sender: b, receiverUser: a } ], _id: { $ne: msg._id } }, { $set: { pinned: false } }, { new: true });
    }

    if (!msg.pinned) {
      msg.pinned = true;
      await msg.save();
    }

    const io = getIO();
    const updates = [];
    updates.push({ _id: msg._id.toString(), pinned: true });
    if (prevPinned) updates.push({ _id: prevPinned._id.toString(), pinned: false });

    if (msg.roomId) {
      updates.forEach((u) => io?.to(msg.roomId.toString()).emit("messageUpdated", u));
    } else if (msg.receiverUser) {
      updates.forEach((u) => {
        emitToUser(String(msg.receiverUser), "messageUpdated", u);
        emitToUser(String(msg.sender), "messageUpdated", u);
      });
    }

    return res.status(200).json(new ApiResponse(200, { updates }, "Message pinned"));
  } catch (e) {
    throw new ApiError(500, "Failed to pin message", e.message);
  }
});

export const unpinMessage = asyncHandler(async (req, res) => {
  try {
    const { messageId } = req.params;
    if (!messageId) throw new ApiError(400, "messageId required");
    const msg = await Message.findById(messageId);
    if (!msg) throw new ApiError(404, "Message not found");

    if (msg.pinned) {
      msg.pinned = false;
      await msg.save();
    }

    const payload = { _id: msg._id.toString(), pinned: false };
    const io = getIO();
    if (msg.roomId) {
      io?.to(msg.roomId.toString()).emit("messageUpdated", payload);
    } else if (msg.receiverUser) {
      emitToUser(String(msg.receiverUser), "messageUpdated", payload);
      emitToUser(String(msg.sender), "messageUpdated", payload);
    }

    return res.status(200).json(new ApiResponse(200, payload, "Message unpinned"));
  } catch (e) {
    throw new ApiError(500, "Failed to unpin message", e.message);
  }
});



export const listRooms = asyncHandler(async (req, res) => {
  await ensureDefaultRooms();
  const rooms = await ChatRoom.find({ isPrivate: false }).sort({
    createdAt: 1,
  });
  return res.status(200).json(new ApiResponse(200, rooms, "Rooms fetched"));
});

export const getRoomMessages = asyncHandler(async (req, res) => {
  try {

  const { roomId } = req.params;
  const { limit = 50, before } = req.query;
  if (!roomId) throw new ApiError(400, "roomId required");
  const q = { roomId };
  if (before) {
    q.createdAt = { $lt: new Date(before) };
  }
  const msgs = await Message.find(q)
    .populate("sender", "fullname avatar")
    .populate({ path: 'replyTo', select: 'content type sender createdAt', populate: { path: 'sender', select: 'fullname avatar' } })
    .sort({ createdAt: -1 })
    .limit(Number(limit));
  return res
    .status(200)
    .json(new ApiResponse(200, msgs.reverse(), "Room messages"));

  } catch (e) {
    throw new ApiError(500, "Failed to fetch room messages", e.message);
  }
  });

export const getPrivateMessages = asyncHandler(async (req, res) => {
  try{
  const { userId } = req.params;
  const me = req.user._id;
  const { limit = 50, before } = req.query;
  const q = {
    $or: [
      { sender: me, receiverUser: userId },
      { sender: userId, receiverUser: me },
    ],
  };
  if (before) q.createdAt = { $lt: new Date(before) };
  const msgs = await Message.find(q)
    .populate("sender", "fullname avatar")
    .populate({ path: 'replyTo', select: 'content type sender createdAt', populate: { path: 'sender', select: 'fullname avatar' } })
    .sort({ createdAt: -1 })
    .limit(Number(limit));
  return res
    .status(200)
    .json(new ApiResponse(200, msgs.reverse(), "Private messages"));
  } catch (e) {
    throw new ApiError(500, "Failed to fetch private messages", e.message);
  }
});

export const uploadChatFile = asyncHandler(async (req, res) => {
  try {
  const file = req.file;
  if (!file) throw new ApiError(400, "No file uploaded");
  const up = await uploadOnCloudinary(file.path);
  if (!up?.secure_url) throw new ApiError(500, "Upload failed");
  let type = "text";
  if (up.resource_type === "image" || file.mimetype.startsWith("image/"))
    type = "image";
  else if (up.resource_type === "video" || file.mimetype.startsWith("video/"))
    type = "video";
  return res
    .status(201)
    .json(new ApiResponse(201, { url: up.secure_url, type }, "Uploaded"));
  } catch (e) {
    throw new ApiError(500, "Failed to upload chat file", e.message);
  }
});

export const getPrivateContacts = asyncHandler(async (req, res) => {
  try {
  const me = req.user._id;
  const conv = await Message.aggregate([
    { $match: { $or: [{ sender: me }, { receiverUser: me }] } },
    {
      $project: {
        other: {
          $cond: [{ $eq: ["$sender", me] }, "$receiverUser", "$sender"],
        },
        content: 1,
        type: 1,
        createdAt: 1,
        sender: 1,
        receiverUser: 1,
      },
    },
    { $match: { other: { $ne: null } } },
    { $sort: { createdAt: -1 } },
    { $group: { _id: "$other", lastMessage: { $first: "$$ROOT" } } },
    { $limit: 50 },
  ]);
  const results = await Message.populate(conv, {
    path: "_id",
    model: "User",
    select: "fullname avatar",
  });
  const formatted = results
    .filter(r => r._id) 
    .map((r) => ({
      user: {
        _id: r._id._id.toString(),
        fullname: r._id.fullname,
        avatar: r._id.avatar,
      },
      lastMessage: r.lastMessage,
      online: presenceStore.isUserOnline(r._id._id.toString()),
    }));
  return res
    .status(200)
    .json(new ApiResponse(200, formatted, "Contacts fetched"));
  } catch (e) {
    throw new ApiError(500, "Failed to fetch private contacts", e.message);
  }
});

export const getOrCreateChatThread = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    const me = req.user._id;
    
    if (!userId) throw new ApiError(400, "userId required");
    if (userId === me.toString()) throw new ApiError(400, "Cannot create chat thread with yourself");
    
    const existingMessages = await Message.findOne({
      $or: [
        { sender: me, receiverUser: userId },
        { sender: userId, receiverUser: me },
      ],
    }).populate("sender", "fullname avatar");
    
    if (existingMessages) {
      const otherUser = await Message.findOne({
        $or: [
          { sender: me, receiverUser: userId },
          { sender: userId, receiverUser: me },
        ],
      }).populate("sender", "fullname avatar")
        .populate("receiverUser", "fullname avatar");
      
      const targetUser = otherUser.sender._id.toString() === me.toString() 
        ? otherUser.receiverUser 
        : otherUser.sender;
        
      return res.status(200).json(new ApiResponse(200, {
        userId: targetUser._id,
        user: {
          _id: targetUser._id,
          fullname: targetUser.fullname,
          avatar: targetUser.avatar,
        },
        exists: true,
      }, "Chat thread found"));
    }
    
    const { User } = await import("../models/user.model.js");
    const targetUser = await User.findById(userId).select("fullname avatar");
    
    if (!targetUser) throw new ApiError(404, "User not found");
    
    return res.status(200).json(new ApiResponse(200, {
      userId: targetUser._id,
      user: {
        _id: targetUser._id,
        fullname: targetUser.fullname,
        avatar: targetUser.avatar,
      },
      exists: false,
    }, "New chat thread ready"));
    
  } catch (e) {
    throw new ApiError(500, "Failed to get or create chat thread", e.message);
  }
});
