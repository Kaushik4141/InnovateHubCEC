import { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Feed from './Feed';
import Projects from './Projects';
import Competitions from './Competitions';
import MentorsList from './MentorsList';
import FloatingDock from './FloatingDock';
import SlideMenu from './SlideMenu';
import { networkApi, type ConnectionSuggestion } from '../services/networkApi';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('feed');
  const [suggestions, setSuggestions] = useState<ConnectionSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const apiBase = import.meta.env.VITE_API_URL as string | undefined;
  const navigate = useNavigate();

  const renderContent = () => {
    switch (activeTab) {
      case 'feed':
        return <Feed />;
      case 'projects':
        return <Projects />;
      case 'competitions':
        return <Competitions />;
      case 'mentors':
        return <MentorsList />;
      default:
        return <Feed />;
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingSuggestions(true);
        const data = await networkApi.getConnectionSuggestions(undefined, 5);
        setSuggestions(data || []);
      } catch (e) {
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    };
    load();
  }, []);

  const avatarUrl = (u: { _id?: string; fullname?: string; avatar?: string }) => (
    !u?.avatar || (u.avatar && u.avatar.includes('default_avatar'))
      ? `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(u._id || u.fullname || 'user')}&size=48`
      : (u.avatar as string)
  );

  const handleConnect = async (userId: string) => {
    try {
      await networkApi.sendConnectionRequest(userId);
      setSuggestions(prev => prev.filter(s => s._id !== userId));
    } catch (e) {
      // ignore for now
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/20 text-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Now scrolls with content */}
          <div className="hidden lg:block order-2 lg:order-1">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          
          {/* Main Content */}
          <div className="order-1 lg:order-2 lg:col-span-2">
            <div className="transition-all duration-300 ease-out">
              {renderContent()}
            </div>
          </div>
          
          {/* Right Panel - Now scrolls with content */}
          <div className="hidden lg:block lg:order-3 lg:col-span-1">
            <div className="space-y-6">
              {/* Developer Roadmaps */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30 transition-all duration-200 hover:bg-gray-800/70">
                <h3 className="font-semibold mb-4 text-purple-400">Developer Roadmaps</h3>
                <div className="space-y-3">
                  {[
                    { role: 'Frontend Developer', link: 'https://roadmap.sh/frontend' },
                    { role: 'Backend Developer', link: 'https://roadmap.sh/backend' },
                    { role: 'Fullstack Developer', link: 'https://roadmap.sh/full-stack' },
                    { role: 'Blockchain Developer', link: 'https://roadmap.sh/blockchain' },
                    { role: 'AI/ML Engineer', link: 'https://roadmap.sh/ai' },
                    { role: 'More', link: 'https://roadmap.sh' },
                  ].map((item) => (
                    <div
                      key={item.role}
                      onClick={() => window.open(item.link, '_blank')}
                      className="flex justify-between items-center hover:bg-gray-700/50 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span className="text-sm font-medium text-white">{item.role}</span>
                      <span className="text-xs text-purple-400 hover:text-purple-300">View →</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30 transition-all duration-200 hover:bg-gray-800/70">
                <h3 className="font-semibold mb-4 text-purple-400">Upcoming Events</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-purple-500 pl-4 hover:bg-gray-700/30 rounded-r-lg p-2 transition-all duration-200">
                    <h4 className="font-medium text-sm text-white">Tech Talk: AI in Healthcare</h4>
                    <p className="text-xs text-gray-400">Tomorrow, 3:00 PM</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4 hover:bg-gray-700/30 rounded-r-lg p-2 transition-all duration-200">
                    <h4 className="font-medium text-sm text-white">Hackathon Registration</h4>
                    <p className="text-xs text-gray-400">Dec 15, 2024</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4 hover:bg-gray-700/30 rounded-r-lg p-2 transition-all duration-200">
                    <h4 className="font-medium text-sm text-white">Project Showcase</h4>
                    <p className="text-xs text-gray-400">Dec 20, 2024</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30 transition-all duration-200 hover:bg-gray-800/70">
                <h3 className="font-semibold mb-4 text-purple-400">Your Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">Profile Completion</span>
                      <span className="text-purple-400 font-medium">75%</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500" style={{width: '75%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">Monthly Goal</span>
                      <span className="text-green-400 font-medium">3/5 projects</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500" style={{width: '60%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">Network Growth</span>
                      <span className="text-blue-400 font-medium">89 connections</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500" style={{width: '45%'}}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* People You May Know */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30 transition-all duration-200 hover:bg-gray-800/70">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-purple-400">People You May Know</h3>
                  <button 
                    className="text-xs text-gray-400 hover:text-purple-400 transition-colors duration-200" 
                    onClick={() => navigate('/network')}
                  >
                    See all →
                  </button>
                </div>
                {loadingSuggestions ? (
                  <div className="text-sm text-gray-400 flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                  </div>
                ) : suggestions.length === 0 ? (
                  <div className="text-sm text-gray-400 text-center py-4">No suggestions right now</div>
                ) : (
                  <ul className="space-y-4">
                    {suggestions.map((s) => (
                      <li key={s._id} className="flex items-center justify-between group">
                        <div className="flex items-center min-w-0">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-blue-500 mr-3 flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
                            <img
                              src={avatarUrl(s)}
                              alt={s.fullname}
                              className="w-full h-full object-cover"
                              onError={(e) => { 
                                e.currentTarget.onerror = null; 
                                e.currentTarget.src = ((apiBase ? apiBase.replace(/\/$/, '') : '') + '/default_avatar.png'); 
                              }}
                            />
                          </div>
                          <div className="min-w-0">
                            <p 
                              className="text-sm font-medium truncate cursor-pointer hover:text-purple-400 transition-colors duration-200" 
                              onClick={() => navigate(`/profile/c/${encodeURIComponent(s.fullname)}`)}
                            >
                              {s.fullname}
                            </p>
                            <p className="text-xs text-gray-400 truncate">{s.bio || 'Student'}</p>
                            <p className="text-xs text-gray-500">{s.mutualConnections} mutual connections</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleConnect(s._id)}
                          className="ml-3 flex items-center bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-purple-700 whitespace-nowrap transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-purple-500/30"
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Connect
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <FloatingDock onMenuToggle={() => setMenuOpen(true)} />
      <SlideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
};

export default Dashboard;