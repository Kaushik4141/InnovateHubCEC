import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Bell, MessageCircle, User, Home, Users, Briefcase,
  ChevronDown, Settings, LogOut, Plus,
  Trophy, Handshake, Menu, X, Group
} from 'lucide-react';
import axios from 'axios';

const Header = () => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const apiBase = import.meta.env.VITE_API_URL;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<{ users: any[]; posts: any[] }>({ users: [], posts: [] });

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${apiBase}/api/v1/users/notifications`, {
        withCredentials: true,
      });
      setNotifications(res.data?.data?.notifications || []);
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [apiBase]);

  useEffect(() => {
    if (showNotifications) fetchNotifications();
  }, [showNotifications]);
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await axios.get(`${apiBase}/api/v1/users/current-user`, { withCredentials: true });
        setUser(res.data?.data || res.data);
      } catch (e) {
        console.error('Failed to fetch current user', e);
      }
    };
    fetchMe();
  }, [apiBase]);

  const avatarUrl = (u: { _id?: string; fullname?: string; avatar?: string } | null) => (
    !u?.avatar || (u.avatar && u.avatar.includes('default_avatar'))
      ? `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(u?._id || u?.fullname || 'user')}&size=48`
      : (u.avatar as string)
  );

  const initials = (name?: string) => {
    if (!name) return 'ME';
    const parts = name.trim().split(/\s+/);
    return (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
  };

  //Default avatar fallback
  const defaultAvatarFallback = (apiBase ? apiBase.replace(/\/$/, '') : '') + '/default_avatar.png';
  const onImgErr = (e: any) => {
    const img = e.currentTarget as HTMLImageElement;
    img.onerror = null;
    img.src = defaultAvatarFallback;
  };

  //Debounced search i am using instagram knowledge
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults({ users: [], posts: [] });
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    setSearchOpen(true);
    const t = setTimeout(async () => {
      try {
        const [uRes, pRes] = await Promise.all([
          axios.get(`${apiBase}/api/v1/users/search`, { params: { q }, withCredentials: true }),
          axios.get(`${apiBase}/api/v1/posts/getAllPost`, { params: { query: q, limit: 5 }, withCredentials: true }),
          
        ]);
        const users = uRes.data?.data || [];
        const posts = pRes.data?.data?.result || [];
        setSearchResults({ users, posts });
      } catch (e) {

        setSearchResults({ users: [], posts: [] });
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, apiBase]);

  const handleAccept = async (fromUserId: string) => {
    try {
      await axios.post(
        `${apiBase}/api/v1/users/${fromUserId}/accept-follow`,
        {},
        { withCredentials: true }
      );
      setNotifications((prev) => prev.filter((n: any) => n.from?._id !== fromUserId));
    } catch (e) {
      console.error('Accept follow failed', e);
    }
  };

  const handleReject = async (fromUserId: string) => {
    try {
      await axios.post(
        `${apiBase}/api/v1/users/${fromUserId}/reject-follow`,
        {},
        { withCredentials: true }
      );
      setNotifications((prev) => prev.filter((n: any) => n.from?._id !== fromUserId));
    } catch (e) {
      console.error('Reject follow failed', e);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${apiBase}/api/v1/users/logout`, {}, { withCredentials: true });
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button onClick={() => navigate('/')} className="flex items-center">
              <img src="logo1.png" alt="logo" className="h-8 w-8 text-purple-400" />
              <span className="ml-2 text-xl font-bold text-white">InnovateHubCEC</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8 hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search people, posts/projects..."
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
              />
              {searchOpen && (searchQuery.trim().length >= 2 || searchLoading) && (
                <div className="absolute mt-2 left-0 right-0 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                  {searchLoading ? (
                    <div className="p-4 text-gray-400 text-sm">Searching...</div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      <div className="p-2 border-b border-gray-700">
                        <p className="text-xs uppercase text-gray-400 px-2">People</p>
                        {searchResults.users.length === 0 && (
                          <div className="px-2 py-2 text-sm text-gray-500">No people found</div>
                        )}
                        {searchResults.users.map((u) => (
                          <button
                            key={u._id}
                            onClick={() => { setSearchOpen(false); setSearchQuery(''); navigate(`/profile/c/${encodeURIComponent(u.fullname)}`); }}
                            className="w-full flex items-center gap-3 px-2 py-2 hover:bg-gray-700 text-left"
                          >
                            <img src={avatarUrl(u)} onError={onImgErr} alt={u.fullname} className="w-8 h-8 rounded-full object-cover" />
                            <span className="text-sm text-white">{u.fullname}</span>
                          </button>
                        ))}
                      </div>
                      <div className="p-2">
                        <p className="text-xs uppercase text-gray-400 px-2">Posts / Projects</p>
                        {searchResults.posts.length === 0 && (
                          <div className="px-2 py-2 text-sm text-gray-500">No posts/projects found</div>
                        )}
                        {searchResults.posts.map((p: any) => (
                          <button
                            key={p._id}
                            onClick={() => { setSearchOpen(false); setSearchQuery(''); if (p.owner?.fullname) navigate(`/profile/c/${encodeURIComponent(p.owner.fullname)}`); }}
                            className="w-full flex items-center gap-3 px-2 py-2 hover:bg-gray-700 text-left"
                          >
                            {Array.isArray(p.postFile) && p.postFile[0] ? (
                              <img src={p.postFile[0]} alt="thumb" className="w-10 h-10 rounded object-cover" />
                            ) : (
                              <div className="w-10 h-10 bg-gray-700 rounded" />
                            )}
                            <div>
                              <p className="text-sm text-white line-clamp-1">{p.description || 'Project post'}</p>
                              {p.owner?.fullname && (
                                <p className="text-xs text-gray-400">by {p.owner.fullname}</p>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <button
            className="sm:hidden p-2 text-gray-300 hover:text-white"
            aria-label="Open search"
            onClick={() => setMobileSearchOpen((v) => !v)}
          >
            {mobileSearchOpen ? <X className="h-6 w-6" /> : <Search className="h-6 w-6" />}
          </button>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex flex-col items-center text-gray-400 hover:text-purple-400 transition-colors"
            >
              <Home className="h-5 w-5" />
              <span className="text-xs mt-1">Home</span>
            </button>
            <button 
              onClick={() => navigate('/chat')}
              className="flex flex-col items-center text-gray-400 hover:text-purple-400 transition-colors"
              >
                <Handshake className="h-5 w-5" />
                <span className="text-xs mt-1">Chat</span>
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
              <Trophy className="h-5 w-5" />
              <span className="text-xs mt-1">Leaderboard</span>
            </button>
            <button 
              onClick={() => navigate('/Team')}
              className="flex flex-col items-center text-gray-400 hover:text-purple-400 transition-colors"
            >
              <Group className="h-5 w-5" />
              <span className="text-xs mt-1">Our Team</span>
            </button>
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="flex flex-col items-center text-gray-400 hover:text-purple-400 transition-colors"
              >
                <Bell className="h-5 w-5" />
                <span className="text-xs mt-1">Notifications</span>
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {Math.min(notifications.length, 99)}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-700">
                    <h3 className="font-semibold text-white">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 && (
                      <div className="p-4 text-sm text-gray-400">No notifications</div>
                    )}
                    {notifications.map((n: any) => (
                      <div key={n._id} className="p-4 border-b border-gray-700 hover:bg-gray-700">
                        {n.type === 'follow-request' ? (
                          <div className="flex items-center gap-3">
                            <img
                              src={avatarUrl(n.from)}
                              alt={n.from?.fullname || 'User'}
                              className="w-8 h-8 rounded-full object-cover"
                              onError={onImgErr}
                            />
                            <div className="flex-1">
                              <p className="text-sm text-white">
                                <span className="font-medium">{n.from?.fullname}</span> wants to connect.
                              </p>
                              <div className="mt-2 flex gap-2">
                                <button
                                  onClick={() => handleAccept(n.from._id)}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleReject(n.from._id)}
                                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm text-white">Notification</p>
                            {n.date && (
                              <p className="text-xs text-gray-400 mt-1">{new Date(n.date).toLocaleString()}</p>
                            )}
                          </div>
                        )}
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
                {user ? (
                  <img
                    src={avatarUrl(user)}
                    alt={user?.fullname || 'User'}
                    className="w-8 h-8 rounded-full object-cover mr-2"
                    onError={onImgErr}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-2">
                    ME
                  </div>
                )}
                <span className="text-xs">{user?.fullname?.split(' ')[0] || 'Me'}</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>
              
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center">
                      {user ? (
                        <img
                          src={avatarUrl(user)}
                          alt={user?.fullname || 'User'}
                          className="w-12 h-12 rounded-full object-cover mr-3"
                          onError={onImgErr}
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                          {initials('Me')}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-white">{user?.fullname || 'Me'}</p>
                        {user?.year && (
                          <p className="text-sm text-gray-400">Year: {user.year}</p>
                        )}
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
                    <button className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 flex items-center" onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Post Button */}
            <button
              onClick={() => navigate('/addpost')}
              className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors"
              aria-label="Add Project"
              title="Add Project"
            >
              <Plus className="h-5 w-5" />
            </button>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden ml-2 p-2 text-gray-300 hover:text-white"
            aria-label="Open menu"
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {/* Mobile search panel */}
      {mobileSearchOpen && (
        <div className="sm:hidden bg-gray-800 border-t border-gray-700 px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search people, posts/projects..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
            />
            {searchOpen && (searchQuery.trim().length >= 2 || searchLoading) && (
              <div className="absolute mt-2 left-0 right-0 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                {searchLoading ? (
                  <div className="p-4 text-gray-400 text-sm">Searching...</div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    <div className="p-2 border-b border-gray-700">
                      <p className="text-xs uppercase text-gray-400 px-2">People</p>
                      {searchResults.users.length === 0 && (
                        <div className="px-2 py-2 text-sm text-gray-500">No people found</div>
                      )}
                      {searchResults.users.map((u) => (
                        <button
                          key={u._id}
                          onClick={() => { setSearchOpen(false); setMobileSearchOpen(false); setSearchQuery(''); navigate(`/profile/c/${encodeURIComponent(u.fullname)}`); }}
                          className="w-full flex items-center gap-3 px-2 py-2 hover:bg-gray-700 text-left"
                        >
                          <img src={avatarUrl(u)} onError={onImgErr} alt={u.fullname} className="w-8 h-8 rounded-full object-cover" />
                          <span className="text-sm text-white">{u.fullname}</span>
                        </button>
                      ))}
                    </div>
                    <div className="p-2">
                      <p className="text-xs uppercase text-gray-400 px-2">Posts / Projects</p>
                      {searchResults.posts.length === 0 && (
                        <div className="px-2 py-2 text-sm text-gray-500">No posts/projects found</div>
                      )}
                      {searchResults.posts.map((p: any) => (
                        <button
                          key={p._id}
                          onClick={() => { setSearchOpen(false); setMobileSearchOpen(false); setSearchQuery(''); if (p.owner?.fullname) navigate(`/profile/c/${encodeURIComponent(p.owner.fullname)}`); }}
                          className="w-full flex items-center gap-3 px-2 py-2 hover:bg-gray-700 text-left"
                        >
                          {Array.isArray(p.postFile) && p.postFile[0] ? (
                            <img src={p.postFile[0]} alt="thumb" className="w-10 h-10 rounded object-cover" />
                          ) : (
                            <div className="w-10 h-10 bg-gray-700 rounded" />
                          )}
                          <div>
                            <p className="text-sm text-white line-clamp-1">{p.description || 'Project post'}</p>
                            {p.owner?.fullname && (
                              <p className="text-xs text-gray-400">by {p.owner.fullname}</p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Mobile menu panel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700 px-4 py-3">
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => { setMobileMenuOpen(false); navigate('/dashboard'); }} className="flex items-center gap-2 bg-gray-700 rounded-lg p-3 text-gray-200">
              <Home className="h-5 w-5" /> Home
            </button>
            <button onClick={() => { setMobileMenuOpen(false); navigate('/chat'); }} className="flex items-center gap-2 bg-gray-700 rounded-lg p-3 text-gray-200">
              <Handshake className="h-5 w-5" /> Chat
            </button>
            <button onClick={() => { setMobileMenuOpen(false); navigate('/network'); }} className="flex items-center gap-2 bg-gray-700 rounded-lg p-3 text-gray-200">
              <Users className="h-5 w-5" /> Network
            </button>
            <button onClick={() => { setMobileMenuOpen(false); navigate('/jobs'); }} className="flex items-center gap-2 bg-gray-700 rounded-lg p-3 text-gray-200">
              <Briefcase className="h-5 w-5" /> Jobs
            </button>
            <button onClick={() => { setMobileMenuOpen(false); navigate('/messages'); }} className="flex items-center gap-2 bg-gray-700 rounded-lg p-3 text-gray-200">
              <MessageCircle className="h-5 w-5" /> Messages
            </button>
            <button onClick={() => { setMobileMenuOpen(false); navigate('/Leaderboard'); }} className="flex items-center gap-2 bg-gray-700 rounded-lg p-3 text-gray-200">
              <Trophy className="h-5 w-5" /> Leaderboard
            </button>
          </div>
          <div className="mt-3 flex gap-3">
            <button onClick={() => { setMobileMenuOpen(false); navigate('/profile'); }} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-2">
              Profile
            </button>
            <button onClick={handleLogout} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg p-2">
              Logout
            </button>
            <button onClick={() => { setMobileMenuOpen(false); navigate('/Team  '); }} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg p-2">
              Our Team
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
