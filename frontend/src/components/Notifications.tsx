import { useEffect, useState } from 'react';
import Header from './Header';
import { Bell, UserPlus } from 'lucide-react';
import { getNotifications, RawNotification } from '../services/notificationsApi';
import { networkApi } from '../services/networkApi';

const Notifications = () => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'follow-request' | 'other'>('all');
  const [notifications, setNotifications] = useState<RawNotification[]>([]);
  const apiBase = import.meta.env.VITE_API_URL as string | undefined;

  const fetchAll = async () => {
    try {
      const list = await getNotifications();
      setNotifications(list);
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const avatarUrl = (u?: { _id?: string; fullname?: string; avatar?: string } | null) => (
    !u?.avatar || (u.avatar && u.avatar.includes('default_avatar'))
      ? `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(u?._id || u?.fullname || 'user')}&size=48`
      : (u.avatar as string)
  );
  const defaultAvatarFallback = (apiBase ? apiBase.replace(/\/$/, '') : '') + '/default_avatar.png';
  const onImgErr = (e: any) => {
    const img = e.currentTarget as HTMLImageElement;
    img.onerror = null;
    img.src = defaultAvatarFallback;
  };

  const handleAccept = async (fromUserId: string) => {
    try {
      await networkApi.acceptConnectionRequest(fromUserId);
      await fetchAll();
    } catch (e) {
      console.error('Accept follow failed', e);
    }
  };

  const handleReject = async (fromUserId: string) => {
    try {
      await networkApi.declineConnectionRequest(fromUserId);
      await fetchAll();
    } catch (e) {
      console.error('Reject follow failed', e);
    }
  };

  const filterTypes = [
    { name: 'All', value: 'all', count: notifications.length },
    { name: 'Unread', value: 'unread', count: notifications.filter(n => !n.read).length },
    { name: 'Follow Requests', value: 'follow-request', count: notifications.filter(n => n.type === 'follow-request').length },
    { name: 'Others', value: 'other', count: notifications.filter(n => n.type !== 'follow-request').length }
  ];

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    if (filter === 'follow-request') return n.type === 'follow-request';
    return n.type !== 'follow-request';
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
            <p className="text-gray-400">
              {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'You\'re all caught up!'}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
          <div className="flex flex-wrap gap-2">
            {filterTypes.map((filterType) => (
              <button
                key={filterType.value}
                onClick={() => setFilter(filterType.value as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === (filterType.value as any)
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {filterType.name} ({filterType.count})
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((n) => (
              <div 
                key={n._id}
                className={`bg-gray-800 rounded-xl p-6 border transition-all duration-300 hover:border-purple-500 ${
                  !n.read ? 'border-purple-500 bg-purple-900 bg-opacity-10' : 'border-gray-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex items-start">
                    {/* Avatar */}
                    <div className="w-12 h-12 mr-4 flex-shrink-0">
                      {n.from && typeof n.from === 'object' ? (
                        <img
                          src={avatarUrl(n.from)}
                          alt={n.from.fullname || 'User'}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={onImgErr}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                          <UserPlus className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="font-semibold text-white">
                          {n.type === 'follow-request' ? (
                            <>
                              <span className="font-medium">{(n.from as any)?.fullname || 'Someone'}</span> wants to connect
                            </>
                          ) : (
                            'Notification'
                          )}
                        </h3>
                        {!n.read && (
                          <div className="w-2 h-2 bg-purple-500 rounded-full ml-2"></div>
                        )}
                      </div>
                      {n.date && (
                        <p className="text-sm text-gray-500">{new Date(n.date).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  {n.type === 'follow-request' && n.from && typeof n.from === 'object' && (
                    <div className="flex items-center gap-2 sm:ml-4 mt-3 sm:mt-0">
                      <button 
                        onClick={() => handleAccept((n.from as any)._id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => handleReject((n.from as any)._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Bell className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No notifications found</h3>
              <p className="text-gray-500">
                {filter === 'all' 
                  ? "You don't have any notifications yet" 
                  : `No ${filter} notifications found`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;