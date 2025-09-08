import { useState, useEffect, useCallback } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Feed from './Feed';
import Projects from './Projects';
import Competitions from './Competitions';
import MentorsList from './MentorsList';
import FloatingDock from './FloatingDock';
import TourGuide from './TourGuide';
import { useTour } from '../hooks/useTour';
import { networkApi, type ConnectionSuggestion } from '../services/networkApi';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowUp } from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('feed');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { showTour, completeTour, skipTour } = useTour();
  
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

  const [suggestions, setSuggestions] = useState<ConnectionSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const apiBase = import.meta.env.VITE_API_URL as string | undefined;
  const navigate = useNavigate();

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

  // Scroll to top function
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Show/hide scroll to top button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="order-2 lg:order-1">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          <div className="order-1 lg:order-2 lg:col-span-2 relative" data-tour="main-feed">
            {renderContent()}
          </div>
          <div className="hidden lg:block lg:order-3 lg:col-span-1">
            <div className="space-y-6">
              {/* Developer Roadmaps */}
              <div className="bg-gray-800 rounded-xl p-6" data-tour="roadmaps">
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
                      className="flex justify-between items-center hover:bg-gray-700 p-2 rounded cursor-pointer transition"
                    >
                      <span className="text-sm font-medium text-white">{item.role}</span>
                      <span className="text-xs text-gray-400">View</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="bg-gray-800 rounded-xl p-6" data-tour="events">
                <h3 className="font-semibold mb-4 text-purple-400">Upcoming Events</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-medium text-sm">Tech Talk: AI in Healthcare</h4>
                    <p className="text-xs text-gray-400">Tomorrow, 3:00 PM</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium text-sm">Hackathon Registration</h4>
                    <p className="text-xs text-gray-400">Dec 15, 2024</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-medium text-sm">Project Showcase</h4>
                    <p className="text-xs text-gray-400">Dec 20, 2024</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gray-800 rounded-xl p-6" data-tour="progress">
                <h3 className="font-semibold mb-4 text-purple-400">Your Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Profile Completion</span>
                      <span>75%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{width: '75%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Monthly Goal</span>
                      <span>3/5 projects</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '60%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Network Growth</span>
                      <span>89 connections</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '45%'}}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* People You May Know */}
              <div className="bg-gray-800 rounded-xl p-6" data-tour="suggestions">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-purple-400">People You May Know</h3>
                  <button className="text-xs text-gray-400 hover:text-white" onClick={() => navigate('/network')}>
                    See all
                  </button>
                </div>
                {loadingSuggestions ? (
                  <div className="text-sm text-gray-400">Loading...</div>
                ) : suggestions.length === 0 ? (
                  <div className="text-sm text-gray-400">No suggestions right now</div>
                ) : (
                  <ul className="space-y-4">
                    {suggestions.map((s) => (
                      <li key={s._id} className="flex items-center justify-between">
                        <div className="flex items-center min-w-0">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-blue-500 mr-3 flex-shrink-0">
                            <img
                              src={avatarUrl(s)}
                              alt={s.fullname}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = ((apiBase ? apiBase.replace(/\/$/, '') : '') + '/default_avatar.png'); }}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate cursor-pointer hover:underline" onClick={() => navigate(`/profile/c/${encodeURIComponent(s.fullname)}`)}>{s.fullname}</p>
                            <p className="text-xs text-gray-400 truncate">{s.bio || 'Student'}</p>
                            <p className="text-xs text-gray-500">{s.mutualConnections} mutual connections</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleConnect(s._id)}
                          className="ml-3 flex items-center bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-purple-700 whitespace-nowrap"
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
      
      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 z-50 p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          aria-label="Scroll to top"
        >
          <ArrowUp size={24} />
        </button>
      )}
      
      <FloatingDock />
      
      {/* Tour Guide */}
      <TourGuide 
        isVisible={showTour}
        onComplete={completeTour}
        onSkip={skipTour}
      />
    </div>
  );
};

export default Dashboard;