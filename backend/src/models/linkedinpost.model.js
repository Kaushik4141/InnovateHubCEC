import mongoose from "mongoose";

const linkedinPostSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    url: { type: String, required: true },
    text: { type: String },
    images: [{ value: String }],
    createdAt: { type: Date, default: Date.now },
});
linkedinPostSchema.index({ owner: 1, text: 1 }, { unique: true });
export const LinkedinPost = mongoose.model("LinkedinPost", linkedinPostSchema);