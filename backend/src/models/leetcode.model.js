import mongoose from "mongoose";

const leetcodeStatsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
  },
  ranking: {
    type: Number,
    required: true
  },
  totalSolved: Number,
  easySolved: Number,
  mediumSolved: Number,
  hardSolved: Number,
  acceptanceRate: Number,
  contributionPoints: Number,
  reputation: Number,
  submissionCalendar: Object,
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

export const LeetcodeStats = mongoose.model("LeetcodeStats", leetcodeStatsSchema);
