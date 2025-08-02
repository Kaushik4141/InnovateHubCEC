import mongoose, { Schema } from "mongoose";
const githubStatsSchema = new Schema(
    {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, 
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    totalContributions: {
      type: Number,
      default: 0,
    },
    thisYearContributions: {
      type: Number,
      default: 0,
    },
    lastMonthContributions: {
        type: Number,
        default: 0,
    },
    thisMonthContributions: {
        type: Number,
        default: 0,
    },
    todayContributions: {
      type: Number,
      default: 0,
    },
  
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const GithubStats = mongoose.model("GithubStats", githubStatsSchema);
