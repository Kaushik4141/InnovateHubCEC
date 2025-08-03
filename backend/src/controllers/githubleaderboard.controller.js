import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponsehandler.js";
import { GithubStats } from "../models/github.model.js";
import { ApiError } from "../utils/apierrorhandler.js";

const getGithubLeaderboard = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  const skip = (page - 1) * limit;

  const sortBy = req.query.sortBy || "totalContributions";
  const validSortFields = [
      "totalContributions", 
      "thisYearContributions", 
      "thisMonthContributions",
      "todayContributions"
    ];

  if (!validSortFields.includes(sortBy)) {
    throw new ApiError(400, "Invalid sort field.");
  }

  
  const leaderboard = await GithubStats.find({})
    .sort({ [sortBy]: -1 })
    .skip(skip)
    .limit(limit)
    .select("-user -_id -__v"); 

  const totalRecords = await GithubStats.countDocuments();

  if (!leaderboard) {
    throw new ApiError(404, "Leaderboard data not available.");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        leaderboard,
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit),
        totalUsers: totalRecords,
      },
      "Leaderboard fetched successfully from the database"
    )
  );
});
export { getGithubLeaderboard };
