import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apierrorhandler.js";
import { ApiResponse } from "../utils/apiresponsehandler.js";
import { ChatRoom } from "../models/chatroom.model.js";
import { Message } from "../models/message.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { presenceStore } from "../socket.js";

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
    throw new ApiError("Failed to ensure default rooms", 500, e.message);
  }
};

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
  const formatted = results.map((r) => ({
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
