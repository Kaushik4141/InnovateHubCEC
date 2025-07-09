import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Users, Trophy, Code, MessageCircle, Bookmark, TrendingUp, Calendar } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  return (
    <div className="lg:col-span-1">
      {/* Profile Card */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">
            YU
          </div>
          <h3 className="font-semibold">Your Name</h3>
          <p className="text-sm text-gray-400">3rd Year CSE</p>
          <p className="text-xs text-gray-500 mt-1">Canara Engineering College</p>
        </div>
        
        <div className="space-y-2 text-sm border-t border-gray-700 pt-4">
          <div className="flex justify-between">
            <span className="text-gray-400">Profile Views</span>
            <span className="text-purple-400 font-medium">127</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Projects</span>
            <span className="text-purple-400 font-medium">5</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Connections</span>
            <span className="text-purple-400 font-medium">89</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Competitions Won</span>
            <span className="text-purple-400 font-medium">2</span>
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/profile')}
          className="w-full mt-4 bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
        >
          View Profile
        </button>
      </div>

      {/* Navigation */}
      <nav className="bg-gray-800 rounded-xl p-4 mb-6">
        <ul className="space-y-2">
          <li>
            <button 
              onClick={() => setActiveTab('feed')}
              className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${activeTab === 'feed' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              <Home className="h-5 w-5 mr-3" />
              Feed
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('projects')}
              className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${activeTab === 'projects' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              <Code className="h-5 w-5 mr-3" />
              Projects
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('competitions')}
              className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${activeTab === 'competitions' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              <Trophy className="h-5 w-5 mr-3" />
              Competitions
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('mentors')}
              className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${activeTab === 'mentors' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              <Users className="h-5 w-5 mr-3" />
              Mentors
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigate('/messages')}
              className="w-full flex items-center px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
            >
              <MessageCircle className="h-5 w-5 mr-3" />
              Messages
            </button>
          </li>
          <li>
            <button className="w-full flex items-center px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors">
              <Bookmark className="h-5 w-5 mr-3" />
              Saved
            </button>
          </li>
        </ul>
      </nav>

      {/* Quick Actions */}
      <div className="bg-gray-800 rounded-xl p-4">
        <h3 className="font-semibold mb-4 text-purple-400">Quick Actions</h3>
        <div className="space-y-2">
          <button className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors">
            Share Project
          </button>
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Find Mentor
          </button>
          <button className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
            Join Competition
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;