import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponsehandler.js";
import  {ApiError} from '../utils/apierrorhandler.js';
import { GithubStats } from '../models/github.model.js';
import { LeetcodeStats } from '../models/leetcode.model.js';
import axios from 'axios';


const getGithubActivity = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  const githubStats = await GithubStats.findOne({ user: userId }).populate('user');
  
  if (!githubStats) {
    throw new ApiError(404, 'GitHub stats not found for this user');
  }
  

  const calendar = [];
  

  if (githubStats.submissionCalendar) {
    try {

      const calendarData = typeof githubStats.submissionCalendar === 'string' 
        ? JSON.parse(githubStats.submissionCalendar) 
        : githubStats.submissionCalendar;
      
      Object.entries(calendarData).forEach(([timestamp, count]) => {
        const date = new Date(parseInt(timestamp) * 1000).toISOString().split('T')[0];
        calendar.push({ date, count });
      });
    } catch (error) {
      console.error('Error parsing GitHub submission calendar:', error);
    }
  }
  
  return res.status(200).json(
    new ApiResponse(200, {
      username: githubStats.username,
      calendar,
      languages: githubStats.languages || {},
      topLanguage: githubStats.topLanguage || null,
    }, 'GitHub activity data fetched successfully')
  );
});


const getLeetcodeActivity = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  const leetcodeStats = await LeetcodeStats.findOne({ user: userId }).populate('user');
  
  if (!leetcodeStats) {
    throw new ApiError(404, 'LeetCode stats not found for this user');
  }
  
  const calendar = [];
  
  if (leetcodeStats.submissionCalendar) {
    try {
      const calendarData = typeof leetcodeStats.submissionCalendar === 'string' 
        ? JSON.parse(leetcodeStats.submissionCalendar) 
        : leetcodeStats.submissionCalendar;
      
      Object.entries(calendarData).forEach(([timestamp, count]) => {
        const date = new Date(parseInt(timestamp) * 1000).toISOString().split('T')[0];
        calendar.push({ date, count });
      });
    } catch (error) {
      console.error('Error parsing LeetCode submission calendar:', error);
    }
  }
  
  return res.status(200).json(
    new ApiResponse(200, {
      username: leetcodeStats.username,
      calendar,
      languages: leetcodeStats.languages || {},
      topLanguage: leetcodeStats.topLanguage || null,
    }, 'LeetCode activity data fetched successfully')
  );
});

export {
  getGithubActivity,
  getLeetcodeActivity
};