import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponsehandler.js";
import { LeetcodeStats } from "../models/leetcode.model.js";
import { User } from "../models/user.model.js";
import axios from "axios";
import { ApiError } from "../utils/apierrorhandler.js";

const fetchLeetcodeStatsForUser = async (user) => {
  if (!user.leetcode) return null;
  const username = user.leetcode.split("/").pop();
  console.log(username);
  const url = `https://leetcode-stats-api.herokuapp.com/${username}`;
  try {
    const response = await axios.get(url);
    if (response.data && response.data.status === "success") {
      const data = response.data;
      const stats = {
        user: user._id,
        username: username,
        ranking: data.ranking || Number.MAX_SAFE_INTEGER,
        totalSolved: data.totalSolved,
        easySolved: data.easySolved,
        mediumSolved: data.mediumSolved,
        hardSolved: data.hardSolved,
        acceptanceRate: data.acceptanceRate,
        contributionPoints: data.contributionPoints,
        reputation: data.reputation,
        submissionCalendar: data.submissionCalendar,
        lastUpdated: new Date()
      };
      await LeetcodeStats.findOneAndUpdate(
        { user: user._id },
        stats,
        { upsert: true, new: true }
      );
      return stats;
    }
    return null;
  } catch (err) {
   return new ApiError(500, "Failed to fetch LeetCode stats");
  }
};

const refreshAllLeetcodeStats = async () => {
  const users = await User.find({ leetcode: { $exists: true, $ne: null, $ne: "" } });
  await Promise.all(users.map(fetchLeetcodeStatsForUser));
};



const getLeetcodeLeaderboard = asyncHandler(async (req, res) => {
    try {
  const leaderboard = await LeetcodeStats.find({})
    .sort({ ranking: 1 })
    .populate("user", "fullname avatar leetcode")
    .select("-__v -submissionCalendar ");
  return res.status(200).json(new ApiResponse(200, { leaderboard }, "LeetCode leaderboard fetched successfully"));
    }
    catch (error) {
        return new ApiError(500, "Failed to fetch LeetCode leaderboard");
    }
});
export { getLeetcodeLeaderboard , refreshAllLeetcodeStats, fetchLeetcodeStatsForUser};
