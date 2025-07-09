import React, { useState } from 'react';

import { Trophy, Medal, Award, Star, TrendingUp, Code, Users, Target, Crown, Zap, BookOpen, Calendar } from 'lucide-react';

const Leaderboard = () => {
  const [activeCategory, setActiveCategory] = useState('overall');

  const topPerformers = [
    {
      rank: 1,
      name: 'Arjun Mehta',
      avatar: 'AM',
      points: 2450,
      projects: 12,
      competitions: 8,
      badges: ['AI Expert', 'Innovation Leader', 'Top Contributor'],
      trend: '+15%',
      department: 'CSE',
      level: 'Expert',
      streak: 45
    },
    {
      rank: 2,
      name: 'Sneha Reddy',
      avatar: 'SR',
      points: 2280,
      projects: 10,
      competitions: 6,
      badges: ['Web Dev Pro', 'Team Player', 'Mentor'],
      trend: '+12%',
      department: 'IT',
      level: 'Advanced',
      streak: 32
    },
    {
      rank: 3,
      name: 'Vikram Singh',
      avatar: 'VS',
      points: 2150,
      projects: 9,
      competitions: 7,
      badges: ['IoT Specialist', 'Hardware Guru', 'Problem Solver'],
      trend: '+8%',
      department: 'ECE',
      level: 'Advanced',
      streak: 28
    },
    {
      rank: 4,
      name: 'Priya Sharma',
      avatar: 'PS',
      points: 1980,
      projects: 8,
      competitions: 5,
      badges: ['ML Expert', 'Research Star'],
      trend: '+10%',
      department: 'CSE',
      level: 'Intermediate',
      streak: 21
    },
    {
      rank: 5,
      name: 'Rahul Kumar',
      avatar: 'RK',
      points: 1850,
      projects: 7,
      competitions: 4,
      badges: ['Innovation Award', 'Tech Leader'],
      trend: '+6%',
      department: 'ECE',
      level: 'Intermediate',
      streak: 18
    },
    {
      rank: 6,
      name: 'Ananya Patel',
      avatar: 'AP',
      points: 1720,
      projects: 6,
      competitions: 3,
      badges: ['Blockchain Expert', 'Startup Founder'],
      trend: '+14%',
      department: 'IT',
      level: 'Intermediate',
      streak: 25
    },
    {
      rank: 7,
      name: 'Karthik Nair',
      avatar: 'KN',
      points: 1650,
      projects: 5,
      competitions: 4,
      badges: ['Mobile Dev', 'UI/UX Designer'],
      trend: '+9%',
      department: 'CSE',
      level: 'Intermediate',
      streak: 15
    },
    {
      rank: 8,
      name: 'Divya Iyer',
      avatar: 'DI',
      points: 1580,
      projects: 7,
      competitions: 2,
      badges: ['Data Scientist', 'Research Assistant'],
      trend: '+11%',
      department: 'IT',
      level: 'Intermediate',
      streak: 22
    }
  ];

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
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
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

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white border border-slate-700/50'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{category.name}</span>
              </button>
            );
          })}
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
                  {performer.avatar}
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
                {performer.badges.slice(0, 2).map((badge, idx) => (
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

        {/* Achievements Section */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-400" />
            <span>Recent Achievements</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((achievement, index) => {
              const IconComponent = achievement.icon;
              return (
                <div key={index} className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                  <div className="flex items-center space-x-3 mb-2">
                    <IconComponent className={`w-5 h-5 ${achievement.color}`} />
                    <span className="text-white font-medium text-sm">{achievement.title}</span>
                  </div>
                  <p className="text-slate-400 text-sm">{achievement.winner}</p>
                </div>
              );
            })}
          </div>
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
                        {performer.avatar}
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
                  {performer.badges.map((badge, index) => (
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