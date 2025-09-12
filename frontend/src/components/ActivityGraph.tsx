import React, { useEffect, useState } from 'react';
import { Tooltip } from 'react-tooltip';
import ActivityService from '../services/activity.service.ts';

interface ActivityGraphProps {
  type: 'github' | 'leetcode';
  username: string;
}

interface CalendarData {
  date: string;
  count: number;
  level?: number;
}

const ActivityGraph: React.FC<ActivityGraphProps> = ({ type, username }) => {
  const [calendarData, setCalendarData] = useState<CalendarData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tooltipContent, setTooltipContent] = useState<string>('');

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let data;
        if (type === 'github') {
          data = await ActivityService.getGithubActivity(username);
        } else {
          data = await ActivityService.getLeetcodeActivity(username);
        }
        
        if (data && data.success && data.data) {
          setCalendarData(data.data.calendar || []);
        } else {
          throw new Error('Failed to fetch activity data');
        }
      } catch (err) {
        console.error(`Error fetching ${type} activity:`, err);
        setError(`Failed to load ${type} activity data. Please try again later.`);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchActivityData();
    }
  }, [type, username]);

  // Generate calendar grid
  const generateCalendarGrid = () => {
    // If no data, return empty grid
    if (!calendarData.length) {
      return Array(53 * 7).fill(null).map((_, i) => (
        <div key={i} className="w-3 h-3 rounded-sm bg-gray-800" />
      ));
    }

    // Create a map of dates to counts
    const dateMap = new Map();
    calendarData.forEach(item => {
      dateMap.set(item.date, item.count);
    });

    // Get date range
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    // Generate cells for the past year
    const cells = [];
    const currentDate = new Date(oneYearAgo);

    // Adjust to start from the beginning of the week
    const dayOfWeek = currentDate.getDay();
    currentDate.setDate(currentDate.getDate() - dayOfWeek);

    // Generate 53 weeks x 7 days grid
    for (let i = 0; i < 53 * 7; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const count = dateMap.get(dateStr) || 0;
      const intensity = getIntensity(count);
      const color = getColorForIntensity(intensity);
      
      const formattedDate = new Date(dateStr).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      
      cells.push(
        <div 
          key={dateStr} 
          className={`w-3 h-3 rounded-sm ${color}`}
          data-tooltip-id="activity-tooltip"
          data-tooltip-content={`${count} ${type === 'github' ? 'contributions' : 'submissions'} on ${formattedDate}`}
          onMouseEnter={() => setTooltipContent(`${count} ${type === 'github' ? 'contributions' : 'submissions'} on ${formattedDate}`)}
        />
      );

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return cells;
  };

  // Determine intensity level based on count
  const getIntensity = (count: number): number => {
    if (count === 0) return 0;
    if (count <= 3) return 1;
    if (count <= 6) return 2;
    if (count <= 9) return 3;
    return 4;
  };

  // Get color class based on intensity
  const getColorForIntensity = (intensity: number): string => {
    switch (intensity) {
      case 0: return 'bg-gray-800';
      case 1: return 'bg-green-900';
      case 2: return 'bg-green-700';
      case 3: return 'bg-green-500';
      case 4: return 'bg-green-300';
      default: return 'bg-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-gray-900 rounded-lg">
        <div className="animate-pulse flex flex-col space-y-2">
          <div className="h-4 bg-gray-800 rounded w-1/4"></div>
          <div className="grid grid-cols-53 gap-1 mt-2">
            {Array(53 * 7).fill(null).map((_, i) => (
              <div key={i} className="w-3 h-3 rounded-sm bg-gray-800" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-gray-900 rounded-lg text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-900 rounded-lg">
      <h3 className="text-white text-lg mb-2">
        {type === 'github' ? 'GitHub Contributions' : 'LeetCode Submissions'}
      </h3>
      <div className="flex">
        <div className="flex flex-col justify-between text-xs text-gray-400 mr-2">
          <span>Mon</span>
          <span>Wed</span>
          <span>Fri</span>
        </div>
        <div>
          <div className="grid grid-cols-53 gap-1 mb-2">
            {generateCalendarGrid()}
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <div className="flex items-center">
              <span className="mr-1">Less</span>
              <div className="flex space-x-1">
                <div className="w-3 h-3 rounded-sm bg-gray-800" />
                <div className="w-3 h-3 rounded-sm bg-green-900" />
                <div className="w-3 h-3 rounded-sm bg-green-700" />
                <div className="w-3 h-3 rounded-sm bg-green-500" />
                <div className="w-3 h-3 rounded-sm bg-green-300" />
              </div>
              <span className="ml-1">More</span>
            </div>
            <a 
              href={`${type === 'github' ? 'https://github.com/' : 'https://leetcode.com/'}${username}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              View on {type === 'github' ? 'GitHub' : 'LeetCode'}
            </a>
          </div>
        </div>
      </div>
      <Tooltip id="activity-tooltip" />
    </div>
  );
};

export default ActivityGraph;