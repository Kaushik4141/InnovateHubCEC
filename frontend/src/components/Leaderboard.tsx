import React, { useState } from 'react';
import Header from './Header';

import { Trophy, Medal, Award, Star, TrendingUp, Code, Users, Target, Crown, Zap, BookOpen, Calendar } from 'lucide-react';

import axios from 'axios';

const Leaderboard = () => {
  const [activeCategory, setActiveCategory] = useState('overall');
  const [contribType, setContribType] = useState<'overall' | 'thisMonth' | 'lastMonth' | 'thisYear'>('overall');
  const [contribData, setContribData] = useState<any[]>([]);
  const [contribLoading, setContribLoading] = useState(false);
  const [contribError, setContribError] = useState<string|null>(null);
  const apiBase = import.meta.env.VITE_API_URL;

  // Map dropdown type to backend sort fields
  const contribSortMap = {
    overall: 'totalContributions',
    thisMonth: 'thisMonthContributions',
    lastMonth: 'lastMonthContributions',
    thisYear: 'thisYearContributions',
  } as const;

  React.useEffect(() => {
    setContribLoading(true);
    setContribError(null);
    axios.get(`${apiBase}/api/v1/leaderboard/github?sortBy=${contribSortMap[contribType]}`, { withCredentials: true })
      .then(res => {
        setContribData(res.data?.data?.leaderboard?.slice(0, 10) || []);
      })
      .catch(e => {
        setContribError('Failed to fetch contributions leaderboard');
      })
      .finally(() => setContribLoading(false));
  }, [apiBase, contribType]);

  // Map API data to topPerformers format for podium and rankings
  const topPerformers = contribData.map((user: any, idx: number) => ({
    rank: idx + 1,
    name: user.user?.fullname || user.username || 'Unknown',
    avatar: user.user?.avatar || user.user?.fullname?.slice(0, 2) || user.username?.slice(0, 2) || '?',
    points: contribType === 'overall' ? user.totalContributions :
           contribType === 'thisMonth' ? user.thisMonthContributions :
           contribType === 'lastMonth' ? user.lastMonthContributions :
           contribType === 'thisYear' ? user.thisYearContributions : 0,
    projects: user.projects || 0, // If you have this data
    competitions: user.competitions || 0, // If you have this data
    badges: user.badges || [], // If you have this data
    trend: user.trend || '', // If you have this data
    department: user.department || '', // If you have this data
    level: user.level || '', // If you have this data
    streak: user.streak || 0 // If you have this data
  }));

  const categories = [
    { id: 'overall', name: 'Overall', icon: Trophy },
    { id: 'projects', name: 'Projects', icon: Code },
    { id: 'competitions', name: 'Competitions', icon: Target },
    { id: 'contributions', name: 'Contributions', icon: Users },
    { id: 'monthly', name: 'Monthly', icon: Calendar }
  ];

  const achievements = [
    { title: 'Most Innovative Project', winner: 'Arjun Mehta', icon: Zap, color: 'text-yellow-400' },
    { title: 'Best Team Player', winner: 'Sneha Reddy', icon: Users, color: 'text-blue-400' },
    { title: 'Rising Star', winner: 'Ananya Patel', icon: Star, color: 'text-purple-400' },
    { title: 'Knowledge Sharer', winner: 'Vikram Singh', icon: BookOpen, color: 'text-green-400' }
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

  return (
    <div className="min-h-screen bg-gray-900 text-white ">
      <Header />
      <div className="max-w-7xl mx-auto space-y-8">
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

        

       
        <div className="relative flex justify-end mt-4 mb-6">
  
  <div className="relative w-52">
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

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {topPerformers.slice(0, 3).map((performer, index) => (
            <div
              key={performer.rank}
              className={`${getRankBg(performer.rank)} rounded-2xl p-6 border text-center shadow-xl transition-all duration-300 hover:scale-105 ${
                performer.rank === 1 ? 'md:order-2 transform md:scale-110' : 
                performer.rank === 2 ? 'md:order-1' : 'md:order-3'
              }`}
            >
              
              <div className="flex justify-center mb-4">
                {getRankIcon(performer.rank)}
              </div>
              
              <div className="relative mb-4">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mx-auto flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {typeof performer.avatar === 'string' && (performer.avatar.startsWith('http') || performer.avatar.startsWith('/')) ? (
    <img
      src={performer.avatar}
      alt={performer.name}
      className="w-20 h-20 rounded-full object-cover border border-slate-700"
    />
  ) : (
    performer.avatar
  )}
                </div>
                <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded-full text-xs font-medium border ${getLevelColor(performer.level)}`}>
                  {performer.level}
                </div>
              </div>
              
              <h3 className="text-white font-bold text-lg mb-1">{performer.name}</h3>
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
              <div key={performer.rank} className="p-6 hover:bg-slate-700/30 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10">
                      {getRankIcon(performer.rank)}
                    </div>
                    
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                      {typeof performer.avatar === 'string' && (performer.avatar.startsWith('http') || performer.avatar.startsWith('/')) ? (
    <img
      src={performer.avatar}
      alt={performer.name}
      className="w-20 h-20 rounded-full object-cover border border-slate-700"
    />
  ) : (
    performer.avatar
  )}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        performer.rank <= 3 ? 'bg-yellow-400 text-black' : 'bg-slate-600 text-white'
                      }`}>
                        {performer.rank}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-white font-semibold">{performer.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getLevelColor(performer.level)}`}>
                          {performer.level}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm">{performer.department}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-8">
                    <div className="text-center">
                      <div className="text-purple-400 font-bold text-lg">{performer.points.toLocaleString()}</div>
                      <div className="text-slate-400 text-xs">Points</div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm">
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