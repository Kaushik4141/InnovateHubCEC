import React, { useState } from 'react';
import Loader from './loading';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { Trophy, Medal, Award, TrendingUp, Code, Users, Target, Crown, Zap, ChevronDown, ChevronUp, Menu, X } from 'lucide-react';
import axios from 'axios';

const Leaderboard = () => {
  const [leaderboardType, setLeaderboardType] = useState<'github' | 'leetcode'>('github');
  const [contribType, setContribType] = useState<'overall' | 'thisMonth' | 'lastMonth' | 'thisYear'>('overall');
  const [contribData, setContribData] = useState<any[]>([]);
  const [contribLoading, setContribLoading] = useState(false);
  const [contribError, setContribError] = useState<string|null>(null);
  const [expandedUser, setExpandedUser] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    setContribData([]);
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

  const getTopLanguageBadge = (user: any) => {
    if (!user?.topLanguage) return null;
    return `Top Lang: ${user.topLanguage}`;
  };

  const getLanguageBadges = (user: any) => {
    if (!user?.languages || Object.keys(user.languages).length === 0) return [];
    
    return Object.entries(user.languages)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 3)
      .map(([lang, count]: [string, any]) => {
        if (leaderboardType === 'github') {
          const kb = Math.round(count / 1024);
          return `${lang}: ${kb}KB`;
        } else {
          return `${lang}: ${count} solved`;
        }
      });
  };

  const topPerformers = contribData.map((user: any, idx: number) => {
    if (leaderboardType === 'leetcode') {
      const languageBadges = getLanguageBadges(user);
      const topLanguageBadge = getTopLanguageBadge(user);
      
      const badges = [
        `Hard: ${user?.hardSolved ?? 0}`,
        `Acc. Rate: ${user?.acceptanceRate ?? 0}%`,
        `World Ranking: ${user?.ranking ?? '-'}`,
        `Reputation: ${user?.reputation ?? '-'}`,
        `Contrib: ${user?.contributionPoints ?? '-'}`
      ];
      
      if (topLanguageBadge) {
        badges.unshift(topLanguageBadge);
      }
      
      badges.push(...languageBadges);
      
      return {
        rank: idx + 1,
        name: user?.user?.fullname || user?.username || 'Unknown',
        username: user?.username || '',
        avatar: user?.user?.avatar || user?.user?.fullname?.slice?.(0, 2) || user?.username?.slice?.(0, 2) || '?',
        points: typeof user?.totalSolved === 'number' ? user.totalSolved : 0,
        projects: typeof user?.easySolved === 'number' ? user.easySolved : 0,
        competitions: typeof user?.mediumSolved === 'number' ? user.mediumSolved : 0,
        badges,
        trend: '',
        department: user?.user?.leetcode || user?.username || '',
        level: '',
        streak: '',
        leetcodeProfile: user?.user?.leetcode,
        topLanguage: user?.topLanguage || ''
      };
    } else {
      const languageBadges = getLanguageBadges(user);
      const topLanguageBadge = getTopLanguageBadge(user);
      
      const badges = Array.isArray(user?.badges) ? user.badges : [];
      
      if (topLanguageBadge) {
        badges.unshift(topLanguageBadge);
      }
      
      badges.push(...languageBadges);
      
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
        badges,
        trend: user?.trend || '',
        department: user?.department || '',
        level: user?.level || '',
        streak: typeof user?.streak === 'number' ? user.streak : 0,
        topLanguage: user?.topLanguage || ''
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
        return <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />;
      default:
        return <span className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-slate-400 font-bold">#{rank}</span>;
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
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="mt-4 mb-6">
          {/* Mobile Tabs - Now using the same style as desktop */}
          <div className="flex flex-wrap gap-2 justify-center">
            {leaderboardTabs.map(tab => (
              <button
                key={tab.id}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-2 rounded-full font-semibold transition-colors ${leaderboardType === tab.id ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                onClick={() => setLeaderboardType(tab.id as 'github' | 'leetcode')}
              >
                <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="text-center space-y-4 mb-8">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Leaderboard
            </h1>
          </div>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
            Celebrating excellence and innovation in our college community. Compete, collaborate, and climb the ranks!
          </p>
        </div>

        <div className="flex justify-end mb-6">
          <div className="relative w-full sm:w-64">
            <select
              className="w-full bg-slate-900 text-white border border-purple-500/50 rounded-xl px-5 py-3 pl-16 shadow-lg outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200 appearance-none cursor-pointer hover:border-purple-400 hover:bg-slate-800"
              value={contribType}
              onChange={e => setContribType(e.target.value as any)}
            >
              <option value="overall">Overall</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="thisYear">This Year</option>
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-purple-300 transition-transform duration-300">
              <ChevronDown className="w-5 h-5" />
            </span>
          </div>
        </div>
        
        {contribError && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 px-4 py-3">
            {contribError}
          </div>
        )}

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {topPerformers.slice(0, 3).map((performer) => (
            <div
              key={performer.rank}
              className={`${getRankBg(performer.rank)} rounded-2xl p-4 sm:p-6 border text-center shadow-xl transition-all duration-300 hover:scale-[1.02] ${
                performer.rank === 1 ? 'md:order-2 md:transform md:scale-105' : 
                performer.rank === 2 ? 'md:order-1' : 
                performer.rank === 3 ? 'md:order-3' : 'md:order-1'
              }`}
            >
              <div className="flex justify-center mb-3 sm:mb-4">
                {getRankIcon(performer.rank)}
              </div>
              <div className="relative mb-3 sm:mb-4">
                <button
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mx-auto flex items-center justify-center text-white font-bold text-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
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
                      className="w-full h-full rounded-full object-cover border border-slate-700"
                    />
                  ) : (
                    <span className="text-sm sm:text-base">{performer.avatar}</span>
                  )}
                </button>
                {performer.level && (
                  <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded-full text-xs font-medium border ${getLevelColor(performer.level)}`}>
                    {performer.level}
                  </div>
                )}
              </div>
              <button
                className="text-white font-bold text-base sm:text-lg mb-1 hover:underline focus:outline-none truncate max-w-full"
                style={{ background: 'none', border: 'none', cursor: performer.name !== 'Unknown' ? 'pointer' : 'default' }}
                onClick={() => {
                  if (performer.name !== 'Unknown') navigate(`/profile/c/${encodeURIComponent(performer.name)}`);
                }}
                aria-label={`View profile of ${performer.name}`}
              >
                {performer.name}
              </button>
              {performer.username && (
                <div className="text-xs text-purple-300 font-mono mb-1 truncate max-w-full">{performer.username}</div>
              )}
              <p className="text-slate-400 text-xs sm:text-sm mb-2 sm:mb-3 truncate max-w-full">{performer.department}</p>
              <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {performer.points.toLocaleString()}
                </div>
                <div className="text-xs text-slate-400">points</div>
              </div>
              <div className="flex items-center justify-center space-x-3 sm:space-x-4 text-xs sm:text-sm mb-3 sm:mb-4">
                <div className="flex items-center space-x-1">
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" />
                  <span className="text-slate-300">{performer.streak}</span>
                </div>
                <div className="flex items-center space-x-1 text-green-400">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{performer.trend}</span>
                </div>
              </div>

              {/* Display top language if available */}
              {performer.topLanguage && (
                <div className="mb-3 px-3 py-1 bg-blue-600/20 text-blue-300 text-xs rounded-full border border-blue-600/30 inline-block">
                  Top: {performer.topLanguage}
                </div>
              )}

              <div className="flex flex-wrap gap-1 justify-center">
                {performer.badges.slice(0, 2).map((badge: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded-full border border-purple-600/30"
                  >
                    {badge.length > 20 ? `${badge.substring(0, 20)}...` : badge}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Full Rankings */}
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden mb-8">
          <div className="p-4 sm:p-6 border-b border-slate-700/50">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center space-x-2">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              <span>Full Rankings</span>
            </h2>
          </div>
          <div className="divide-y divide-slate-700/50">
            {topPerformers.map((performer) => (
              <div 
                key={performer.rank} 
                className="p-4 sm:p-6 hover:bg-slate-700/30 transition-all duration-200"
                onClick={() => setExpandedUser(expandedUser === performer.rank ? null : performer.rank)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                    <div className="flex items-center justify-center w-8 sm:w-10">
                      {getRankIcon(performer.rank)}
                    </div>
                    <div className="relative">
                      <button
                        className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
                        style={{ cursor: performer.name !== 'Unknown' ? 'pointer' : 'default' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (performer.name !== 'Unknown') navigate(`/profile/c/${encodeURIComponent(performer.name)}`);
                        }}
                        aria-label={`View profile of ${performer.name}`}
                      >
                        {typeof performer.avatar === 'string' && (performer.avatar.startsWith('http') || performer.avatar.startsWith('/')) ? (
                          <img
                            src={performer.avatar}
                            alt={performer.name}
                            className="w-full h-full rounded-full object-cover border border-slate-700"
                          />
                        ) : (
                          <span className="text-xs sm:text-sm">{performer.avatar}</span>
                        )}
                      </button>
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        performer.rank <= 3 ? 'bg-yellow-400 text-black' : 'bg-slate-600 text-white'
                      }`}>
                        {performer.rank}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <button
                        className="text-white font-semibold hover:underline focus:outline-none truncate max-w-full block text-left"
                        style={{ background: 'none', border: 'none', cursor: performer.name !== 'Unknown' ? 'pointer' : 'default' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (performer.name !== 'Unknown') navigate(`/profile/c/${encodeURIComponent(performer.name)}`);
                        }}
                        aria-label={`View profile of ${performer.name}`}
                      >
                        {performer.name}
                      </button>
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                        {performer.level && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getLevelColor(performer.level)}`}>
                            {performer.level}
                          </span>
                        )}
                        {performer.username && (
                          <div className="text-xs text-purple-300 font-mono truncate max-w-[100px] sm:max-w-none">
                            {performer.username}
                          </div>
                        )}
                        {/* Display top language if available */}
                        {performer.topLanguage && (
                          <div className="text-xs text-blue-300 font-mono px-2 py-0.5 bg-blue-600/10 rounded-full border border-blue-600/20">
                            {performer.topLanguage}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-4 sm:gap-6 ml-4">
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
                  
                  {/* Mobile Points Display */}
                  <div className="sm:hidden flex flex-col items-end ml-2">
                    <div className="text-purple-400 font-bold text-lg">{performer.points.toLocaleString()}</div>
                    <div className="text-slate-400 text-xs">Points</div>
                  </div>
                  
                  <button 
                    className="ml-2 sm:ml-4 text-slate-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedUser(expandedUser === performer.rank ? null : performer.rank);
                    }}
                  >
                    {expandedUser === performer.rank ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Expanded Content for Mobile */}
                {expandedUser === performer.rank && (
                  <div className="mt-4 sm:hidden border-t border-slate-700/50 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4 text-slate-300">
                        <div className="flex items-center space-x-1">
                          <Code className="w-4 h-4" />
                          <span>Projects: {performer.projects}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Trophy className="w-4 h-4" />
                          <span>Competitions: {performer.competitions}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-orange-400">
                        <Zap className="w-4 h-4" />
                        <span>Streak: {performer.streak}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {performer.badges.map((badge: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-600/20 text-purple-300 text-xs rounded-full border border-purple-600/30"
                        >
                          {badge.length > 30 ? `${badge.substring(0, 30)}...` : badge}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Desktop Badges */}
                <div className="hidden sm:block mt-4 flex flex-wrap gap-2">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="bg-slate-800/50 rounded-2xl p-4 sm:p-6 border border-slate-700/50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm sm:text-base">Active Students</h3>
                <p className="text-slate-400 text-xs sm:text-sm">This month</p>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-2">1,247</div>
            <div className="flex items-center space-x-1 text-green-400 text-xs sm:text-sm">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>+12% from last month</span>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-4 sm:p-6 border border-slate-700/50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Code className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm sm:text-base">Projects Shared</h3>
                <p className="text-slate-400 text-xs sm:text-sm">This month</p>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-2">89</div>
            <div className="flex items-center space-x-1 text-green-400 text-xs sm:text-sm">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>+8% from last month</span>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-2xl p-4 sm:p-6 border border-slate-700/50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm sm:text-base">Competitions</h3>
                <p className="text-slate-400 text-xs sm:text-sm">This month</p>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-2">23</div>
            <div className="flex items-center space-x-1 text-green-400 text-xs sm:text-sm">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>+15% from last month</span>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="bg-gray-900 border-t border-gray-800 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-400 text-sm sm:text-base">
            © 2025 InnovateHubCEC
          </div>
        </footer>
      </div>
    </div> 
  );
};

export default Leaderboard;