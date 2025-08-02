import { asyncHandler } from "../utils/asynchandler";
import { ApiError } from "../utils/apierrorhandler.js";
import axios from "axios";
const githubdata= asyncHandler(async (req, res) => {
    try {
        const { username } =await req.user.github;


const apiUrl = `https://github-contributions-api.jogruber.de/v4/${username}`;
    }
    catch (error) {
      throw new ApiError(500, "Failed to fetch GitHub data");
    }
    try {
        const response = await axios.get(apiUrl);
         const data = await response.json();
        if (!data) {
            throw new ApiError(`API request failed with status: ${response.status}`);
        }

        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const lastMonthDate = new Date(today);
        lastMonthDate.setMonth(today.getMonth() - 1);
        const lastMonthYear = lastMonthDate.getFullYear();
        const lastMonthNumber = lastMonthDate.getMonth() + 1;
        const todaydata = today.toISOString().split('T')[0];
        const yesterdaydata = yesterday.toISOString().split('T')[0];
        const todayContribution = data.contributions.find(c => c.date === todaydata)?.count || 0;
        const yesterdayContribution = data.contributions.find(c => c.date === yesterdaydata)?.count || 0;
         const overallContributions = Object.values(data.total).reduce((sum, count) => sum + count, 0);
         
        const thisMonthContributions = data.contributions
            .filter(c => {
                const [year, month] = c.date.split('-').map(Number);
                return year === currentYear && month === currentMonth;
            })
            .reduce((sum, c) => sum + c.count, 0);

        const lastMonthContributions = data.contributions
            .filter(c => {
                const [year, month] = c.date.split('-').map(Number);
                return year === lastMonthYear && month === lastMonthNumber;
            })
            .reduce((sum, c) => sum + c.count, 0);
            
        const thisYearContributions = data.total[currentYear.toString()] || 0;

        const lastMonthName = lastMonthDate.toLocaleString('default', { month: 'long' });
        // console.log(`Today's Contributions:`, todayContribution);
        // console.log(`Yesterday's Contributions :`, yesterdayContribution);
        // console.log(`This Month's Contributions:`, thisMonthContributions);
        // console.log(`Last Month's Contributions :`, lastMonthContributions);
        // console.log(`This Year's Contributions:`, thisYearContributions);
        // console.log(`Overall Contributions:`, overallContributions);

    } catch (error) {
        console.error("An error occurred:", error.message);
        throw new ApiError(500, "Failed to fetch GitHub data");
    }
    return res.status(200).json(new ApiResponse(200, { data }, "GitHub data fetched successfully"));
});
export { githubdata };