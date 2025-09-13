import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Bell, MessageCircle, User, Home, Users, Briefcase,
  ChevronDown, Settings, LogOut, Plus,
  Trophy, Handshake, Menu, X, Group, Award, UserCheck, Folder,
  Calendar, Map, Shield, MessageSquare
} from 'lucide-react';
import axios from '../cookiescheker';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on a mobile device
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axios.get(`${apiBase}/api/v1/users/notifications`, {
        withCredentials: true,
      });
      setNotifications(res.data?.data?.notifications || []);
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    }
  }, [apiBase]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (showNotifications) fetchNotifications();
  }, [showNotifications, fetchNotifications]);

  useEffect(() => {
    const handler = () => fetchNotifications();
    window.addEventListener('app:notifications-refresh', handler);
    return () => window.removeEventListener('app:notifications-refresh', handler);
  }, [fetchNotifications]);

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

  // Default avatar fallback
  const defaultAvatarFallback = (apiBase ? apiBase.replace(/\/$/, '') : '') + '/default_avatar.png';
  const onImgErr = (e: any) => {
    const img = e.currentTarget as HTMLImageElement;
    img.onerror = null;
    img.src = defaultAvatarFallback;
  };

  // Debounced search
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

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.search-container')) {
        setSearchOpen(false);
      }
    };

    if (searchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [searchOpen]);

  return (
    <>
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <button onClick={() => navigate('/')} className="flex items-center" data-tour="logo">
                <img src="/logo1.png" alt="InnovateHubCEC" className="h-8 w-8" />
                <span className="ml-2 text-xl font-bold text-white hidden sm:block">InnovateHubCEC</span>
                <span className="ml-2 text-xl font-bold text-white sm:hidden">InnovateHubCEC</span>
              </button>
            </div>

            {/* Desktop Search Bar */}
            <div className="flex-1 max-w-2xl mx-8 hidden md:block">
              <div className="relative search-container" data-tour="search">
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

            {/* Mobile Search and Menu Buttons */}
            <div className="flex items-center space-x-2 md:hidden">
              <button
                className="p-2 text-gray-300 hover:text-white transition-colors"
                aria-label="Open search"
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              >
                {mobileSearchOpen ? <X className="h-6 w-6" /> : <Search className="h-6 w-6" />}
              </button>
              
              {/* Mobile Notifications Button */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-300 hover:text-white transition-colors"
                  data-tour="notifications"
                >
                  <Bell className="h-6 w-6" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {Math.min(notifications.length, 9)}
                    </span>
                  )}
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-300 hover:text-white transition-colors"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {/* Desktop Navigation */}
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
                onClick={() => navigate('/leaderboard')}
                className="flex flex-col items-center text-gray-400 hover:text-purple-400 transition-colors"
              >
                <Trophy className="h-5 w-5" />
                <span className="text-xs mt-1">Leaderboard</span>
              </button>
              <button 
                onClick={() => navigate('/team')}
                className="flex flex-col items-center text-gray-400 hover:text-purple-400 transition-colors"
              >
                <Group className="h-5 w-5" />
                <span className="text-xs mt-1">Our Team</span>
              </button>

              {/* Desktop Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="flex flex-col items-center text-gray-400 hover:text-purple-400 transition-colors"
                  data-tour="notifications"
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

              {/* Desktop Profile Menu */}
              <div className="relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center text-gray-400 hover:text-purple-400 transition-colors"
                  data-tour="profile-menu"
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
                      {/* Conditionally show Admin link */}
                      {user?.role === 'admin' && (
                        <button 
                          onClick={() => navigate('/admin')}
                          className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 flex items-center"
                        >
                          <Shield className="h-4 w-4 mr-3" />
                          Admin Panel
                        </button>
                      )}
                      <button className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 flex items-center" onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop Post Button */}
              <button
                onClick={() => navigate('/addpost')}
                className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors"
                aria-label="Add Project"
                title="Add Project"
                data-tour="add-post"
              >
                <Plus className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>

        {/* Mobile Search Panel */}
        {mobileSearchOpen && (
          <div className="md:hidden bg-gray-800 border-t border-gray-700 px-4 py-3 animate-slideDown">
            <div className="relative search-container">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search people, posts/projects..."
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                autoFocus
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
                            onClick={() => { 
                              setSearchOpen(false); 
                              setMobileSearchOpen(false); 
                              setSearchQuery(''); 
                              navigate(`/profile/c/${encodeURIComponent(u.fullname)}`); 
                            }}
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
                            onClick={() => { 
                              setSearchOpen(false); 
                              setMobileSearchOpen(false); 
                              setSearchQuery(''); 
                              if (p.owner?.fullname) navigate(`/profile/c/${encodeURIComponent(p.owner.fullname)}`); 
                            }}
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
      </header>

      {/* Mobile Notifications Modal */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden">
          <div className="fixed bottom-0 left-0 right-0 bg-gray-900 rounded-t-2xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-white">Notifications</h3>
              <button 
                onClick={() => setShowNotifications(false)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 && (
                <div className="p-4 text-sm text-gray-400 text-center">No notifications</div>
              )}
              {notifications.map((n: any) => (
                <div key={n._id} className="p-4 border-b border-gray-700">
                  {n.type === 'follow-request' ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={avatarUrl(n.from)}
                        alt={n.from?.fullname || 'User'}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={onImgErr}
                      />
                      <div className="flex-1">
                        <p className="text-sm text-white">
                          <span className="font-medium">{n.from?.fullname}</span> wants to connect.
                        </p>
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => handleAccept(n.from._id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleReject(n.from._id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
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
            <div className="p-4 border-t border-gray-700">
              <button 
                onClick={() => {
                  setShowNotifications(false);
                  navigate('/notifications');
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-3 font-medium"
              >
                View all notifications
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Modal */}
      <div className={`
  fixed inset-0 z-50 md:hidden transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]
  ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible delay-500'}
`}>
        {/* Backdrop */}
        <div 
          className={`
            absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]
            ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}
          `}
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Menu Panel */}
        <div className={`
          absolute top-0 right-0 h-full w-80 bg-gray-900/98 backdrop-blur-xl border-l border-gray-700/50
          transform transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]
          ${mobileMenuOpen ? 'translate-x-0 scale-100' : 'translate-x-full scale-95'}
          shadow-2xl
        `}>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
              <h2 className="text-lg font-semibold text-white">Menu</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700/50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {/* Profile Section */}
              <div className={`
                flex items-center space-x-4 mb-8 transition-all duration-500 ease-out
                ${mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
              `} style={{ transitionDelay: '100ms' }}>
                <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-blue-500 flex-shrink-0 ring-2 ring-purple-500/30">
                  {user && (
                    <img
                      src={avatarUrl(user)}
                      alt={user.fullname}
                      className="w-full h-full object-cover"
                      onError={onImgErr}
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">{user?.fullname || 'User'}</h3>
                  <p className="text-sm text-gray-400">{user?.year}th year</p>
                </div>
              </div>
              
              {/* Featured Items - Mobile Only */}
              <div className="space-y-2 mb-6">
                <div className="text-xs uppercase text-purple-400 font-semibold tracking-wider mb-3 px-2">Featured</div>
                
                <button 
                  onClick={() => { navigate('/competitions'); setMobileMenuOpen(false); }}
                  className={`
                    w-full flex items-center space-x-4 px-4 py-4 text-gray-300 hover:text-white 
                    hover:bg-gradient-to-r hover:from-orange-600/20 hover:to-orange-500/20 
                    rounded-xl transition-all duration-300 group border border-transparent hover:border-orange-500/30
                    ${mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                  `}
                  style={{ transitionDelay: '200ms' }}
                >
                  <div className="p-2 bg-orange-600/20 rounded-lg group-hover:bg-orange-600/30 transition-colors">
                    <Award className="h-5 w-5 text-orange-400" />
                  </div>
                  <span className="font-medium">Competitions</span>
                </button>
                
                <button 
                  onClick={() => { navigate('/contests'); setMobileMenuOpen(false); }}
                  className={`
                    w-full flex items-center space-x-4 px-4 py-4 text-gray-300 hover:text-white 
                    hover:bg-gradient-to-r hover:from-pink-600/20 hover:to-pink-500/20 
                    rounded-xl transition-all duration-300 group border border-transparent hover:border-pink-500/30
                    ${mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                  `}
                  style={{ transitionDelay: '250ms' }}
                >
                  <div className="p-2 bg-pink-600/20 rounded-lg group-hover:bg-pink-600/30 transition-colors">
                    <Calendar className="h-5 w-5 text-pink-400" />
                  </div>
                  <span className="font-medium">Contests</span>
                </button>
                
<button 
  onClick={() => {
    window.open('https://roadmap.sh', '_blank');
    setMobileMenuOpen(false);
  }}
  className={`
    w-full flex items-center space-x-4 px-4 py-4 text-gray-300 hover:text-white 
    hover:bg-gradient-to-r hover:from-indigo-600/20 hover:to-indigo-500/20 
    rounded-xl transition-all duration-300 group border border-transparent hover:border-indigo-500/30
    ${mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
  `}
  style={{ transitionDelay: '300ms' }}
>
  <div className="p-2 bg-indigo-600/20 rounded-lg group-hover:bg-indigo-600/30 transition-colors">
    <Map className="h-5 w-5 text-indigo-400" />
  </div>
  <span className="font-medium">Roadmaps</span>
</button>
                
                <button 
                  onClick={() => { navigate('/mentors'); setMobileMenuOpen(false); }}
                  className={`
                    w-full flex items-center space-x-4 px-4 py-4 text-gray-300 hover:text-white 
                    hover:bg-gradient-to-r hover:from-emerald-600/20 hover:to-emerald-500/20 
                    rounded-xl transition-all duration-300 group border border-transparent hover:border-emerald-500/30
                    ${mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                  `}
                  style={{ transitionDelay: '350ms' }}
                >
                  <div className="p-2 bg-emerald-600/20 rounded-lg group-hover:bg-emerald-600/30 transition-colors">
                    <UserCheck className="h-5 w-5 text-emerald-400" />
                  </div>
                  <span className="font-medium">Mentors</span>
                </button>
                
                <button 
  onClick={() => { navigate('/projects'); setMobileMenuOpen(false); }}
  className={`
    w-full flex items-center space-x-4 px-4 py-4 text-gray-300 hover:text-white 
    hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-blue-500/20 
    rounded-xl transition-all duration-300 group border border-transparent hover:border-blue-500/30
    ${mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
  `}
  style={{ transitionDelay: '400ms' }}
>
  <div className="p-2 bg-blue-600/20 rounded-lg group-hover:bg-blue-600/30 transition-colors">
    <Folder className="h-5 w-5 text-blue-400" />
  </div>
  <span className="font-medium">Projects</span>
</button>
                
                {/* Conditionally show Admin link for mobile */}
                {user?.role === 'admin' && (
                  <button 
                    onClick={() => { navigate('/admin'); setMobileMenuOpen(false); }}
                    className={`
                      w-full flex items-center space-x-4 px-4 py-4 text-gray-300 hover:text-white 
                      hover:bg-gradient-to-r hover:from-red-600/20 hover:to-red-500/20 
                      rounded-xl transition-all duration-300 group border border-transparent hover:border-red-500/30
                      ${mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                    `}
                    style={{ transitionDelay: '450ms' }}
                  >
                    <div className="p-2 bg-red-600/20 rounded-lg group-hover:bg-red-600/30 transition-colors">
                      <Shield className="h-5 w-5 text-red-400" />
                    </div>
                    <span className="font-medium">Admin Panel</span>
                  </button>
                )}
              </div>
              
              {/* Navigation Items */}
              <div className="space-y-2">
                <div className="text-xs uppercase text-gray-500 font-semibold tracking-wider mb-3 px-2">Navigation</div>
                
                <button 
                  onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}
                  className={`
                    w-full flex items-center space-x-4 px-4 py-3 text-gray-300 hover:text-white 
                    hover:bg-gray-700/50 rounded-lg transition-all duration-300
                    ${mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                  `}
                  style={{ transitionDelay: '500ms' }}
                >
                  <Home className="h-5 w-5" />
                  <span className="font-medium">Home</span>
                </button>
                
                <button 
                  onClick={() => { navigate('/chat'); setMobileMenuOpen(false); }}
                  className={`
                    w-full flex items-center space-x-4 px-4 py-3 text-gray-300 hover:text-white 
                    hover:bg-gray-700/50 rounded-lg transition-all duration-300
                    ${mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                  `}
                  style={{ transitionDelay: '550ms' }}
                >
                  <Handshake className="h-5 w-5" />
                  <span className="font-medium">Chat</span>
                </button>
                
                <button 
                  onClick={() => { navigate('/network'); setMobileMenuOpen(false); }}
                  className={`
                    w-full flex items-center space-x-4 px-4 py-3 text-gray-300 hover:text-white 
                    hover:bg-gray-700/50 rounded-lg transition-all duration-300
                    ${mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                  `}
                  style={{ transitionDelay: '600ms' }}
                >
                  <Users className="h-5 w-5" />
                  <span className="font-medium">Network</span>
                </button>
                
                <button 
                  onClick={() => { navigate('/jobs'); setMobileMenuOpen(false); }}
                  className={`
                    w-full flex items-center space-x-4 px-4 py-3 text-gray-300 hover:text-white 
                    hover:bg-gray-700/50 rounded-lg transition-all duration-300
                    ${mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                  `}
                  style={{ transitionDelay: '650ms' }}
                >
                  <Briefcase className="h-5 w-5" />
                  <span className="font-medium">Jobs</span>
                </button>
                
                <button 
                  onClick={() => { navigate('/messages'); setMobileMenuOpen(false); }}
                  className={`
                    w-full flex items-center space-x-4 px-4 py-3 text-gray-300 hover:text-white 
                    hover:bg-gray-700/50 rounded-lg transition-all duration-300
                    ${mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                  `}
                  style={{ transitionDelay: '700ms' }}
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="font-medium">Messages</span>
                </button>
                
                <button 
                  onClick={() => { navigate('/Leaderboard'); setMobileMenuOpen(false); }}
                  className={`
                    w-full flex items-center space-x-4 px-4 py-3 text-gray-300 hover:text-white 
                    hover:bg-gray-700/50 rounded-lg transition-all duration-300
                    ${mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                  `}
                  style={{ transitionDelay: '750ms' }}
                >
                  <Trophy className="h-5 w-5" />
                  <span className="font-medium">Leaderboard</span>
                </button>
                
                <button 
                  onClick={() => { navigate('/Team'); setMobileMenuOpen(false); }}
                  className={`
                    w-full flex items-center space-x-4 px-4 py-3 text-gray-300 hover:text-white 
                    hover:bg-gray-700/50 rounded-lg transition-all duration-300
                    ${mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                  `}
                  style={{ transitionDelay: '800ms' }}
                >
                  <Group className="h-5 w-5" />
                  <span className="font-medium">Our Team</span>
                </button>
                
                <div className="border-t border-gray-700/50 my-4" />
                
                <button 
  onClick={() => { navigate('/feedback'); setMobileMenuOpen(false); }}
  className={`
    w-full flex items-center space-x-4 px-4 py-3 text-gray-300 hover:text-white 
    hover:bg-gray-700/50 rounded-lg transition-all duration-300
    ${mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
  `}
  style={{ transitionDelay: '900ms' }}
>
  <MessageSquare className="h-5 w-5" />
  <span className="font-medium">Feedback</span>
</button>

                <button 
                  onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}
                  className={`
                    w-full flex items-center space-x-4 px-4 py-3 text-gray-300 hover:text-white 
                    hover:bg-gray-700/50 rounded-lg transition-all duration-300
                    ${mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                  `}
                  style={{ transitionDelay: '850ms' }}
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">Profile</span>
                </button>
                
                <button 
                  onClick={() => { navigate('/addpost'); setMobileMenuOpen(false); }}
                  className={`
                    w-full flex items-center space-x-4 px-4 py-3 text-purple-300 hover:text-purple-200 
                    hover:bg-purple-700/20 rounded-lg transition-all duration-300 border border-transparent hover:border-purple-500/30
                    ${mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                  `}
                  style={{ transitionDelay: '900ms' }}
                >
                  <Plus className="h-5 w-5" />
                  <span className="font-medium">Add Project</span>
                </button>
                
                <button 
                  onClick={handleLogout}
                  className={`
                    w-full flex items-center space-x-4 px-4 py-3 text-red-300 hover:text-red-200 
                    hover:bg-red-700/20 rounded-lg transition-all duration-300 border border-transparent hover:border-red-500/30
                    ${mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                  `}
                  style={{ transitionDelay: '950ms' }}
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .pb-safe-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0);
          height: env(safe-area-inset-bottom, 0);
        }
        
        /* Enhanced smooth transitions */
        @keyframes slideIn {
          from {
            transform: translateX(100%) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes fadeInUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.7s cubic-bezier(0.19, 1, 0.22, 1);
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.3s ease-out;
        }
        
        /* Staggered animations for menu items */
        .menu-item-enter {
          animation: fadeInUp 0.4s ease-out forwards;
        }
        
        /* Smooth backdrop blur effect */
        .backdrop-blur-smooth {
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
      `}</style>
    </>
  );
};

export default Header;