import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "ChatRoom", default: null },
    receiverUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    content: { type: String, required: true },
    type: { type: String, enum: ["text", "image", "video"], default: "text" },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null },
  },
  { timestamps: true }
);

messageSchema.index({ roomId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, receiverUser: 1, createdAt: -1 });
messageSchema.index({ replyTo: 1 });

export const Message = mongoose.model("Message", messageSchema);
