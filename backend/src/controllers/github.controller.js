import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apierrorhandler.js";
import { ApiResponse } from "../utils/apiresponsehandler.js";
import axios from "axios";

export const githubdata = asyncHandler(async (req, res) => {
  const githubUrl = req.user?.github;

  if (!githubUrl || typeof githubUrl !== "string") {
    throw new ApiError(400, "GitHub profile URL is not set for this user.");
  }
  const username = githubUrl.split("/").pop();
  if (!username) {
    throw new ApiError(
      400,
      "Could not extract a valid GitHub username from the URL."
    );
  }

  const apiUrl = `https://github-contributions-api.jogruber.de/v4/${username}`;

  const response = await axios.get(apiUrl);
  const data = response.data;

  if (!data || !data.contributions) {
    throw new ApiError(
      404,
      "Contribution data could not be found for the user."
    );
  }

  const getMonthlyTotal = (year, month) =>
    data.contributions
      .filter((c) => {
        const [cYear, cMonth] = c.date.split("-").map(Number);
        return cYear === year && cMonth === month;
      })
      .reduce((sum, c) => sum + c.count, 0);

  const today = new Date();
  const yesterday = new Date(new Date().setDate(today.getDate() - 1));
  const lastMonthDate = new Date(new Date().setMonth(today.getMonth() - 1));
  const toISO = (d) => d.toISOString().slice(0, 10);

  const stats = {
    username,
    today: {
      date: toISO(today),
      count:
        data.contributions.find((c) => c.date === toISO(today))?.count || 0,
    },
    yesterday: {
      date: toISO(yesterday),
      count:
        data.contributions.find((c) => c.date === toISO(yesterday))?.count || 0,
    },
    thisMonth: {
      count: getMonthlyTotal(today.getFullYear(), today.getMonth() + 1),
    },
    lastMonth: {
      name: lastMonthDate.toLocaleString("default", { month: "long" }),
      year: lastMonthDate.getFullYear(),
      count: getMonthlyTotal(
        lastMonthDate.getFullYear(),
        lastMonthDate.getMonth() + 1
      ),
    },
    thisYear: {
      year: today.getFullYear(),
      count: data.total[today.getFullYear()] || 0,
    },
    overall: {
      count: Object.values(data.total).reduce((sum, count) => sum + count, 0),
    },
  };
  //console.log(stats);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        stats,
        "GitHub contribution data fetched successfully"
      )
    );
});
