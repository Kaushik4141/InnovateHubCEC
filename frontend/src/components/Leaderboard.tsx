import React, { useState } from 'react';
import Loader from './loading';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

import { Trophy, Medal, Award, TrendingUp, Code, Users, Target, Crown, Zap } from 'lucide-react';

import axios from 'axios';

const Leaderboard = () => {
  const [leaderboardType, setLeaderboardType] = useState<'github' | 'leetcode'>('github');
  const [contribType, setContribType] = useState<'overall' | 'thisMonth' | 'lastMonth' | 'thisYear'>('overall');
  const [contribData, setContribData] = useState<any[]>([]);
  const [contribLoading, setContribLoading] = useState(false);
  const [contribError, setContribError] = useState<string|null>(null);
  const apiBase = import.meta.env.VITE_API_URL;

  
  const contribSortMap = {
    overall: 'totalContributions',
    thisMonth: 'thisMonthContributions',
    lastMonth: 'lastMonthContributions',
    thisYear: 'thisYearContributions',
  } as const;

  React.useEffect(() => {
    setContribLoading(true);
    setContribError(null);
    setContribData([]); // Clear data on tab switch to avoid stale data
    let url = '';
    if (leaderboardType === 'github') {
      url = `${apiBase}/api/v1/leaderboard/github?sortBy=${contribSortMap[contribType]}`;
    } else {
      url = `${apiBase}/api/v1/leaderboard/leetcode`;
    }
    axios.get(url, { withCredentials: true })
      .then(res => {
        if (leaderboardType === 'github') {
          setContribData(Array.isArray(res.data?.data?.leaderboard) ? res.data.data.leaderboard.slice(0, 10) : []);
        } else {
          // Defensive log for debugging
          console.log('LeetCode leaderboard raw data:', res.data?.data?.leaderboard);
          setContribData(Array.isArray(res.data?.data?.leaderboard) ? res.data.data.leaderboard.slice(0, 10) : []);
        }
      })
      .catch(e => {
        setContribError(`Failed to fetch ${leaderboardType === 'github' ? 'GitHub' : 'LeetCode'} leaderboard`);
        console.error(e);
      })
      .finally(() => setContribLoading(false));
  }, [apiBase, contribType, leaderboardType]);

  const topPerformers = contribData.map((user: any, idx: number) => {
    if (leaderboardType === 'leetcode') {
      return {
        rank: idx + 1,
        name: user?.user?.fullname || user?.username || 'Unknown',
        username: user?.username || '',
        avatar: user?.user?.avatar || user?.user?.fullname?.slice?.(0, 2) || user?.username?.slice?.(0, 2) || '?',
        points: typeof user?.totalSolved === 'number' ? user.totalSolved : 0,
        projects: typeof user?.easySolved === 'number' ? user.easySolved : 0,
        competitions: typeof user?.mediumSolved === 'number' ? user.mediumSolved : 0,
        badges: [
          `Hard: ${user?.hardSolved ?? 0}`,
          `Acc. Rate: ${user?.acceptanceRate ?? 0}%`,
          `World Ranking: ${user?.ranking ?? '-'}`,
          `Reputation: ${user?.reputation ?? '-'}`,
          `Contrib: ${user?.contributionPoints ?? '-'}`
        ],
        trend: '',
        department: user?.user?.leetcode || user?.username || '',
        level: '',
        streak: '',
        leetcodeProfile: user?.user?.leetcode,
      };
    } else {
      return {
        rank: idx + 1,
        name: user?.user?.fullname || user?.username || 'Unknown',
        username: user?.username || '',
        avatar: user?.user?.avatar || user?.user?.fullname?.slice?.(0, 2) || user?.username?.slice?.(0, 2) || '?',
        points: typeof (contribType === 'overall' ? user?.totalContributions :
          contribType === 'thisMonth' ? user?.thisMonthContributions :
          contribType === 'lastMonth' ? user?.lastMonthContributions :
          contribType === 'thisYear' ? user?.thisYearContributions : 0) === 'number'
          ? (contribType === 'overall' ? user?.totalContributions :
            contribType === 'thisMonth' ? user?.thisMonthContributions :
            contribType === 'lastMonth' ? user?.lastMonthContributions :
            contribType === 'thisYear' ? user?.thisYearContributions : 0)
          : 0,
        projects: typeof user?.projects === 'number' ? user.projects : 0,
        competitions: typeof user?.competitions === 'number' ? user.competitions : 0,
        badges: Array.isArray(user?.badges) ? user.badges : [],
        trend: user?.trend || '',
        department: user?.department || '',
        level: user?.level || '',
        streak: typeof user?.streak === 'number' ? user.streak : 0,
      };
    }
  });

  const leaderboardTabs = [
    { id: 'github', name: 'GitHub', icon: Code },
    { id: 'leetcode', name: 'LeetCode', icon: Target },
  ];

  

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-slate-400 font-bold">#{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 shadow-yellow-500/10';
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30 shadow-gray-400/10';
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/30 shadow-amber-600/10';
      default:
        return 'bg-slate-800/50 border-slate-700/50';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Expert':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'Advanced':
        return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'Intermediate':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default:
        return 'text-green-400 bg-green-400/10 border-green-400/20';
    }
  };

  const navigate = useNavigate();

  if (contribLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-900 text-white ">
      <Header />
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="mt-8 mb-6 -mx-4 px-4">
          <div className="flex gap-3 overflow-x-auto whitespace-nowrap md:justify-center">
            {leaderboardTabs.map(tab => (
              <button
                key={tab.id}
                className={`shrink-0 flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition-colors ${leaderboardType === tab.id ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                onClick={() => setLeaderboardType(tab.id as 'github' | 'leetcode')}
              >
                <tab.icon className="w-5 h-5" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>
        <div className="text-center space-y-4 ">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Leaderboard
            </h1>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Celebrating excellence and innovation in our college community. Compete, collaborate, and climb the ranks!
          </p>
        </div>

        <div className="relative mt-4 mb-2 px-4 sm:px-0">
          <div className="relative w-full sm:w-52 sm:ml-auto">
            <select
              className="peer w-full bg-slate-900 text-white border border-purple-500/50 rounded-xl px-5 py-3 pl-16 shadow-lg outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200 appearance-none cursor-pointer hover:border-purple-400 hover:bg-slate-800"
              value={contribType}
              onChange={e => setContribType(e.target.value as any)}
              style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}
            >
              <option value="overall">Overall</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="thisYear">This Year</option>
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-purple-300 transition-transform duration-300 peer-focus:rotate-180">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6"/></svg>
            </span>
          </div>
        </div>
        {contribError && (
          <div className="mx-4 sm:mx-0 mb-6 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 px-4 py-3">
            {contribError}
          </div>
        )}

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {topPerformers.slice(0, 3).map((performer) => (
            <div
              key={performer.rank}
              className={`${getRankBg(performer.rank)} rounded-2xl p-6 border text-center shadow-xl transition-all duration-300 hover:scale-105 ${
                performer.rank === 1 ? 'md:order-2 transform md:scale-110' : 
                performer.rank === 2 ? 'md:order-1' : 
                performer.rank === 3 ? 'md:order-3' : 'md:order-1'
              }`}
            >
              <div className="flex justify-center mb-4">
                {getRankIcon(performer.rank)}
              </div>
              <div className="relative mb-4">
                <button
                  className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mx-auto flex items-center justify-center text-white font-bold text-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                  style={{ cursor: performer.name !== 'Unknown' ? 'pointer' : 'default' }}
                  onClick={() => {
                    if (performer.name !== 'Unknown') navigate(`/profile/c/${encodeURIComponent(performer.name)}`);
                  }}
                  aria-label={`View profile of ${performer.name}`}
                >
                  {typeof performer.avatar === 'string' && (performer.avatar.startsWith('http') || performer.avatar.startsWith('/')) ? (
                    <img
                      src={performer.avatar}
                      alt={performer.name}
                      className="w-20 h-20 rounded-full object-cover border border-slate-700"
                    />
                  ) : (
                    performer.avatar
                  )}
                </button>
                <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded-full text-xs font-medium border ${getLevelColor(performer.level)}`}>
                  {performer.level}
                </div>
              </div>
              <button
                className="text-white font-bold text-lg mb-1 hover:underline focus:outline-none"
                style={{ background: 'none', border: 'none', cursor: performer.name !== 'Unknown' ? 'pointer' : 'default' }}
                onClick={() => {
                  if (performer.name !== 'Unknown') navigate(`/profile/c/${encodeURIComponent(performer.name)}`);
                }}
                aria-label={`View profile of ${performer.name}`}
              >
                {performer.name}
              </button>
              {performer.username && (
                <div className="text-xs text-purple-300 font-mono mb-1">{performer.username}</div>
              )}
              <p className="text-slate-400 text-sm mb-3">{performer.department}</p>
              <div className="space-y-2 mb-4">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {performer.points.toLocaleString()}
                </div>
                <div className="text-xs text-slate-400">points</div>
              </div>
              <div className="flex items-center justify-center space-x-4 text-sm mb-4">
                <div className="flex items-center space-x-1">
                  <Zap className="w-4 h-4 text-orange-400" />
                  <span className="text-slate-300">{performer.streak}</span>
                </div>
                <div className="flex items-center space-x-1 text-green-400">
                  <TrendingUp className="w-4 h-4" />
                  <span>{performer.trend}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 justify-center">
                {performer.badges.slice(0, 2).map((badge: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded-full border border-purple-600/30"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Full Rankings */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
          <div className="p-6 border-b border-slate-700/50">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span>Full Rankings</span>
            </h2>
          </div>
          <div className="divide-y divide-slate-700/50">
            {topPerformers.map((performer) => (
              <div key={performer.rank} className="p-4 sm:p-6 hover:bg-slate-700/30 transition-all duration-200">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10">
                      {getRankIcon(performer.rank)}
                    </div>
                    <div className="relative">
                      <button
                        className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
                        style={{ cursor: performer.name !== 'Unknown' ? 'pointer' : 'default' }}
                        onClick={() => {
                          if (performer.name !== 'Unknown') navigate(`/profile/c/${encodeURIComponent(performer.name)}`);
                        }}
                        aria-label={`View profile of ${performer.name}`}
                      >
                        {typeof performer.avatar === 'string' && (performer.avatar.startsWith('http') || performer.avatar.startsWith('/')) ? (
                          <img
                            src={performer.avatar}
                            alt={performer.name}
                            className="w-12 h-12 rounded-full object-cover border border-slate-700"
                          />
                        ) : (
                          performer.avatar
                        )}
                      </button>
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        performer.rank <= 3 ? 'bg-yellow-400 text-black' : 'bg-slate-600 text-white'
                      }`}>
                        {performer.rank}
                      </div>
                    </div>
                    <button
                      className="text-white font-semibold hover:underline ml-2 focus:outline-none"
                      style={{ background: 'none', border: 'none', cursor: performer.name !== 'Unknown' ? 'pointer' : 'default' }}
                      onClick={() => {
                        if (performer.name !== 'Unknown') navigate(`/profile/c/${encodeURIComponent(performer.name)}`);
                      }}
                      aria-label={`View profile of ${performer.name}`}
                    >
                      {performer.name}
                    </button>
                    <div>
                      <div className="flex items-center space-x-2">
                        
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getLevelColor(performer.level)}`}>
                          {performer.level}
                        </span>
                        {performer.username && (
                          <div className="text-xs text-purple-300 font-mono mb-1">{performer.username}</div>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm">{performer.department}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 md:gap-8 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-center">
                      <div className="text-purple-400 font-bold text-lg">{performer.points.toLocaleString()}</div>
                      <div className="text-slate-400 text-xs">Points</div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center space-x-1 text-slate-300">
                        <Code className="w-4 h-4" />
                        <span>{performer.projects}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-slate-300">
                        <Trophy className="w-4 h-4" />
                        <span>{performer.competitions}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-orange-400">
                        <Zap className="w-4 h-4" />
                        <span>{performer.streak}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 text-green-400 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      <span>{performer.trend}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {performer.badges.map((badge: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-600/20 text-purple-300 text-xs rounded-full border border-purple-600/30"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Active Students</h3>
                <p className="text-slate-400 text-sm">This month</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-2">1,247</div>
            <div className="flex items-center space-x-1 text-green-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+12% from last month</span>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Code className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Projects Shared</h3>
                <p className="text-slate-400 text-sm">This month</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-2">89</div>
            <div className="flex items-center space-x-1 text-green-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+8% from last month</span>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Competitions</h3>
                <p className="text-slate-400 text-sm">This month</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-2">23</div>
            <div className="flex items-center space-x-1 text-green-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+15% from last month</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;