import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponsehandler.js";
import { Post } from "../models/post.model.js";
import { Mentor } from "../models/mentor.model.js";
import { User } from "../models/user.model.js";

export const getLandingStats = asyncHandler(async (req, res) => {
  const [publishedProjects, mentors, activeStudents] = await Promise.all([
    Post.countDocuments({ ispublished: true }),
    Mentor.countDocuments({}),
    User.countDocuments({}),
  ]);

  const competitions = 0;

  return res
    .status(200)
    .json(
      new ApiResponse(200, {
        publishedProjects,
        mentors,
        competitions,
        activeStudents,
      })
    );
});
