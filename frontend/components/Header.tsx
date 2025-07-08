import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Bell, MessageCircle, User, Home, Users, Briefcase, BookOpen,
  ChevronDown, Settings, LogOut, Plus
} from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, text: "Priya Sharma liked your project", time: "2h ago", unread: true },
    { id: 2, text: "New competition: AI Innovation Challenge", time: "4h ago", unread: true },
    { id: 3, text: "Aditya Kumar accepted your connection", time: "1d ago", unread: false }
  ];

  return (
    <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button onClick={() => navigate('/')} className="flex items-center">
              <BookOpen className="h-8 w-8 text-purple-400" />
              <span className="ml-2 text-xl font-bold text-white">InnovateHubCEC</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects, competitions, mentors..."
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex flex-col items-center text-gray-400 hover:text-purple-400 transition-colors"
            >
              <Home className="h-5 w-5" />
              <span className="text-xs mt-1">Home</span>
            </button>
            <button 
              onClick={() => navigate('/network')}
              className="flex flex-col items-center text-gray-400 hover:text-purple-400 transition-colors"
            >
              <Users className="h-5 w-5" />
              <span className="text-xs mt-1">Network</span>
            </button>
            <button 
              onClick={() => navigate('/jobs')}
              className="flex flex-col items-center text-gray-400 hover:text-purple-400 transition-colors"
            >
              <Briefcase className="h-5 w-5" />
              <span className="text-xs mt-1">Jobs</span>
            </button>
            <button 
              onClick={() => navigate('/messages')}
              className="flex flex-col items-center text-gray-400 hover:text-purple-400 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-xs mt-1">Messages</span>
            </button>
            <button 
              onClick={() => navigate('/Leaderboard')}
              className="flex flex-col items-center text-gray-400 hover:text-purple-400 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-xs mt-1">Leaderboard</span>
            </button>
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="flex flex-col items-center text-gray-400 hover:text-purple-400 transition-colors"
              >
                <Bell className="h-5 w-5" />
                <span className="text-xs mt-1">Notifications</span>
                <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-700">
                    <h3 className="font-semibold text-white">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div key={notification.id} className={`p-4 border-b border-gray-700 hover:bg-gray-700 cursor-pointer ${notification.unread ? 'bg-gray-750' : ''}`}>
                        <p className="text-sm text-white">{notification.text}</p>
                        <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-4">
                    <button 
                      onClick={() => navigate('/notifications')}
                      className="text-purple-400 text-sm hover:text-purple-300"
                    >
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center text-gray-400 hover:text-purple-400 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-2">
                  YU
                </div>
                <span className="text-xs">Me</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>
              
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        YU
                      </div>
                      <div>
                        <p className="font-semibold text-white">Your Name</p>
                        <p className="text-sm text-gray-400">3rd Year CSE</p>
                      </div>
                    </div>
                  </div>
                  <div className="py-2">
                    <button 
                      onClick={() => navigate('/profile')}
                      className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 flex items-center"
                    >
                      <User className="h-4 w-4 mr-3" />
                      View Profile
                    </button>
                    <button className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 flex items-center">
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </button>
                    <button className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 flex items-center">
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Post Button */}
            <button className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors">
              <Plus className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
