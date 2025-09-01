import mongoose from "mongoose";

const contestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date, required: true, index: true },
    problems: [{ type: mongoose.Schema.Types.ObjectId, ref: "Problem" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    visibility: { type: String, enum: ["public", "private"], default: "public", index: true }
  },
  { timestamps: true }
);

export const Contest = mongoose.model("Contest", contestSchema);
