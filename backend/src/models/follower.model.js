import mongoose,{Schema} from "mongoose";
const followerSchema = new mongoose.Schema({
    Follower: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    Following: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
}, {
  timestamps: true});
export const Follower = mongoose.model("Follower", followerSchema);
