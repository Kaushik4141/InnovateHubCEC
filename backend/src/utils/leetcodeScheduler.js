import cron from "node-cron";
import { refreshAllLeetcodeStats } from "../controllers/leetcodeleaderboard.controller.js";
export function startLeetcodeStatsScheduler() {
  cron.schedule("0 * * * *", async () => {
    await refreshAllLeetcodeStats();
    console.log("Hourly leetcode stats refresh complete.");
  });
  setTimeout(async () => {
    await refreshAllLeetcodeStats();
    console.log("Initial leetcode stats refresh complete.");
  },10*1000); 
}
