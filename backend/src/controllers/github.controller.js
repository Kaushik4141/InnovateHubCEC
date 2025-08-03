import cron from "node-cron";
import axios from "axios";
import { User } from "../models/user.model.js"; 
import { GithubStats } from "../models/github.model.js";
import { ApiError } from "../utils/apierrorhandler.js";

const BATCH_SIZE = 100; 
const fetchContributionData = async (username) => {
  try {
    const apiUrl = `https://github-contributions-api.jogruber.de/v4/${username}`;
    const response = await axios.get(apiUrl);
    if (response.data && response.data.contributions && response.data.total) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error(`Failed to fetch data for ${username}:`, error.message);
    return null;
  }
};
const calculateStats = (data) => {
    const today = new Date();
    const toISO = (d) => d.toISOString().slice(0, 10);
    const todayStr = toISO(today);
  
    const getMonthlyTotal = (year, month) =>
      data.contributions
        .filter((c) => {
          const [cYear, cMonth] = c.date.split("-").map(Number);
          return cYear === year && cMonth === month;
        })
        .reduce((sum, c) => sum + c.count, 0);

    return {
        todayContributions: data.contributions.find((c) => c.date === todayStr)?.count || 0,
        thisMonthContributions: getMonthlyTotal(today.getFullYear(), today.getMonth() + 1),
        lastMonthContributions: getMonthlyTotal(new Date(new Date().setMonth(today.getMonth() - 1)).getFullYear(), new Date(new Date().setMonth(today.getMonth() - 1)).getMonth() + 1),
        thisYearContributions: data.total[today.getFullYear()] || 0,
        totalContributions: Object.values(data.total).reduce((sum, count) => sum + count, 0),
    };
};
const updateGithubStatsJob = async () => {
  // console.log("Running scheduled job: Updating GitHub stats...");

  try {
    const usersToUpdate = await User.find({ 
        github: { $exists: true, $ne: null } 
    }).sort({ 'githubStats.lastUpdated': 1 }).limit(BATCH_SIZE);

    if (usersToUpdate.length === 0) {
        console.log("No users to update.");
        return;
    }

    for (const user of usersToUpdate) {
      const githubUrl = user.github;
      if (!githubUrl) continue;
      
      const username = githubUrl.split("/").pop();
      if (!username) continue;

      const rawData = await fetchContributionData(username);
      if (!rawData) continue;

      const stats = calculateStats(rawData);
      await GithubStats.findOneAndUpdate(
        { user: user._id },
        {
          $set: {
            username,
            ...stats,
            lastUpdated: new Date(),
          },
        },
        { upsert: true, new: true }
      );
      
      // console.log(`Successfully updated stats for ${username}`);
      await new Promise(resolve => setTimeout(resolve, 500)); 
    }
    console.log(`Job finished. Processed ${usersToUpdate.length} users.`);
  } catch (error) {
    // console.error("Error during scheduled GitHub stats update:", error);
    throw new ApiError(500, "Failed to update GitHub stats");
  }
};
export const startStatsUpdater = () => {
  updateGithubStatsJob();
  cron.schedule("0 * * * *", updateGithubStatsJob);
  console.log("GitHub stats updater job scheduled to run every hour.");
};
