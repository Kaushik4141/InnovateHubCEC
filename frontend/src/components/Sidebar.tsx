import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Users, Trophy, Code, MessageCircle, Bookmark, 
  Menu, X, ShieldCheck 
} from 'lucide-react';
import axios from 'axios';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface User {
  _id: string;
  fullname: string;
  usn: string;
  year: number;
  email: string;
  avatar?: string;
  projects: any[];
  followers: any[];
  following: any[];
  isAdmin?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const apiBase = import.meta.env.VITE_API_URL;
  const [user, setUser] = useState<User | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    axios
      .get(`${apiBase}/api/v1/users/current-user`, { withCredentials: true })
      .then(res => {
        setUser(res.data.data);
      })
      .catch(err => {
        console.error(err);
      });
  }, []);

  const avatarUrl = (u: { _id?: string; fullname?: string; avatar?: string }) => (
    !u?.avatar || (u.avatar && u.avatar.includes('default_avatar'))
      ? `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(u._id || u.fullname || 'user')}&size=48`
      : u.avatar as string
  );

  const tabs = [
    { id: 'feed', label: 'Feed', icon: Home },
    { id: 'projects', label: 'Projects', icon: Code },
    { id: 'competitions', label: 'Competitions', icon: Trophy },
    { id: 'mentors', label: 'Mentors', icon: Users },
  ];

  return (
    <div className="lg:col-span-1">
      {/* Mobile toggle */}
      <button
        className="w-full lg:hidden mb-4 flex items-center justify-between bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl px-4 py-3 text-gray-200 transition-all duration-200 hover:bg-gray-800/70"
        onClick={() => setMobileOpen((v) => !v)}
        aria-expanded={mobileOpen}
        aria-controls="sidebar-content"
      >
        <span className="font-medium">Dashboard Menu</span>
        <div className="transition-transform duration-200" style={{ transform: mobileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </div>
      </button>

      <div 
        id="sidebar-content" 
        className={`
          transition-all duration-300 ease-out origin-top
          ${mobileOpen ? 'block opacity-100 scale-100' : 'hidden lg:block opacity-100 scale-100'}
          lg:opacity-100 lg:scale-100
        `}
      >
        {/* Profile Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700/30 transition-all duration-200 hover:bg-gray-800/70">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-3 transition-transform duration-200 hover:scale-105"> 
              {user && (
                <img
                  src={avatarUrl(user)}
                  alt={user.fullname}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => { 
                    e.currentTarget.onerror = null; 
                    e.currentTarget.src = ((apiBase ? apiBase.replace(/\/$/, '') : '') + '/default_avatar.png'); 
                  }}
                />
              )}
            </div>
            <h3 className="font-semibold text-white">{user?.fullname}</h3>
            <p className="text-sm text-gray-400">{user?.year}th year</p>
            <p className="text-xs text-gray-500 mt-1">Canara Engineering College</p>
          </div>
          
          <div className="space-y-2 text-sm border-t border-gray-700/50 pt-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Profile Views</span>
              <span className="text-purple-400 font-medium">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Projects</span>
              <span className="text-purple-400 font-medium">{user?.projects?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Connections</span>
              <span className="text-purple-400 font-medium">{(user?.followers?.length || 0) + (user?.following?.length || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Competitions Won</span>
              <span className="text-purple-400 font-medium">0</span>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/profile')}
            className="w-full mt-4 bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            View Profile
          </button>
        </div>

        {/* Navigation */}
        <nav className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 mb-6 border border-gray-700/30">
          <ul className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <li key={tab.id}>
                  <button 
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center px-3 py-2 rounded-lg transition-all duration-200
                      ${activeTab === tab.id 
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 scale-[1.02]' 
                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white hover:scale-[1.01]'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5 mr-3 transition-transform duration-200" />
                    {tab.label}
                  </button>
                </li>
              );
            })}
            <li>
              <button 
                onClick={() => navigate('/contests')}
                className="w-full flex items-center px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200 hover:scale-[1.01]"
              >
                <Code className="h-5 w-5 mr-3" />
                Contests
              </button>
            </li>
            <li>
              <button 
                onClick={() => navigate('/messages')}
                className="w-full flex items-center px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200 hover:scale-[1.01]"
              >
                <MessageCircle className="h-5 w-5 mr-3" />
                Messages
              </button>
            </li>
            
            {user?.isAdmin && (
              <li>
                <button 
                  onClick={() => navigate('/admin')}
                  className="w-full flex items-center px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200 hover:scale-[1.01]"
                >
                  <ShieldCheck className="h-5 w-5 mr-3" />
                  Admin
                </button>
              </li>
            )}
            <li>
              <button className="w-full flex items-center px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200 hover:scale-[1.01]">
                <Bookmark className="h-5 w-5 mr-3" />
                Saved
              </button>
            </li>
          </ul>
        </nav>

        {/* Quick Actions */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30">
          <h3 className="font-semibold mb-4 text-purple-400">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-purple-500/30">
              Share Project
            </button>
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-blue-500/30">
              Find Mentor
            </button>
            <button className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-green-500/30">
              Join Competition
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;