import React, { useState } from 'react';
import Header from './Header';
import { 
  Bell, Check, X, Heart, MessageCircle, UserPlus, Trophy, 
  Code, Calendar, Star, Settings, Filter, MoreHorizontal
} from 'lucide-react';

const Notifications = () => {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'like',
      title: 'Priya Sharma liked your project',
      message: 'AI-Powered Study Assistant received a like',
      timestamp: '2 hours ago',
      unread: true,
      avatar: 'PS',
      icon: Heart,
      color: 'text-red-400'
    },
    {
      id: 2,
      type: 'comment',
      title: 'New comment on your post',
      message: 'Raj Patel commented: "Great work on the IoT project! Would love to collaborate."',
      timestamp: '4 hours ago',
      unread: true,
      avatar: 'RP',
      icon: MessageCircle,
      color: 'text-blue-400'
    },
    {
      id: 3,
      type: 'connection',
      title: 'Connection request',
      message: 'Ananya Gupta wants to connect with you',
      timestamp: '6 hours ago',
      unread: true,
      avatar: 'AG',
      icon: UserPlus,
      color: 'text-green-400'
    },
    {
      id: 4,
      type: 'competition',
      title: 'Competition deadline reminder',
      message: 'AI Innovation Challenge deadline is in 3 days',
      timestamp: '8 hours ago',
      unread: false,
      avatar: 'AI',
      icon: Trophy,
      color: 'text-yellow-400'
    },
    {
      id: 5,
      type: 'project',
      title: 'Project milestone achieved',
      message: 'Your project "Campus Food Delivery" reached 100 views',
      timestamp: '1 day ago',
      unread: false,
      avatar: 'YU',
      icon: Code,
      color: 'text-purple-400'
    },
    {
      id: 6,
      type: 'event',
      title: 'Upcoming mentoring session',
      message: 'Session with Aditya Kumar scheduled for tomorrow at 3:00 PM',
      timestamp: '1 day ago',
      unread: false,
      avatar: 'AK',
      icon: Calendar,
      color: 'text-indigo-400'
    },
    {
      id: 7,
      type: 'achievement',
      title: 'New achievement unlocked',
      message: 'You earned the "Helpful Mentor" badge for guiding 5 students',
      timestamp: '2 days ago',
      unread: false,
      avatar: 'YU',
      icon: Star,
      color: 'text-yellow-400'
    },
    {
      id: 8,
      type: 'like',
      title: 'Multiple likes on your post',
      message: '5 people liked your recent achievement post',
      timestamp: '2 days ago',
      unread: false,
      avatar: 'ML',
      icon: Heart,
      color: 'text-red-400'
    },
    {
      id: 9,
      type: 'connection',
      title: 'Connection accepted',
      message: 'Sneha Agarwal accepted your connection request',
      timestamp: '3 days ago',
      unread: false,
      avatar: 'SA',
      icon: UserPlus,
      color: 'text-green-400'
    },
    {
      id: 10,
      type: 'comment',
      title: 'Mentor feedback received',
      message: 'Priyanka Joshi left feedback on your UI/UX design project',
      timestamp: '3 days ago',
      unread: false,
      avatar: 'PJ',
      icon: MessageCircle,
      color: 'text-blue-400'
    }
  ]);

  const filterTypes = [
    { name: 'All', value: 'all', count: notifications.length },
    { name: 'Unread', value: 'unread', count: notifications.filter(n => n.unread).length },
    { name: 'Likes', value: 'like', count: notifications.filter(n => n.type === 'like').length },
    { name: 'Comments', value: 'comment', count: notifications.filter(n => n.type === 'comment').length },
    { name: 'Connections', value: 'connection', count: notifications.filter(n => n.type === 'connection').length },
    { name: 'Competitions', value: 'competition', count: notifications.filter(n => n.type === 'competition').length }
  ];

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return notification.unread;
    return notification.type === filter;
  });

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, unread: false } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, unread: false })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
            <p className="text-gray-400">
              {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'You\'re all caught up!'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center"
              >
                <Check className="h-4 w-4 mr-2" />
                Mark all as read
              </button>
            )}
            <button className="bg-gray-700 text-gray-300 p-2 rounded-lg hover:bg-gray-600 transition-colors">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
          <div className="flex flex-wrap gap-2">
            {filterTypes.map((filterType) => (
              <button
                key={filterType.value}
                onClick={() => setFilter(filterType.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === filterType.value
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
            filteredNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`bg-gray-800 rounded-xl p-6 border transition-all duration-300 hover:border-purple-500 ${
                  notification.unread ? 'border-purple-500 bg-purple-900 bg-opacity-10' : 'border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-4 flex-shrink-0">
                      {notification.avatar}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <notification.icon className={`h-5 w-5 mr-2 ${notification.color}`} />
                        <h3 className="font-semibold text-white">{notification.title}</h3>
                        {notification.unread && (
                          <div className="w-2 h-2 bg-purple-500 rounded-full ml-2"></div>
                        )}
                      </div>
                      <p className="text-gray-300 mb-2 leading-relaxed">{notification.message}</p>
                      <p className="text-sm text-gray-500">{notification.timestamp}</p>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    {notification.unread && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="text-gray-400 hover:text-green-400 transition-colors"
                        title="Mark as read"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(notification.id)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete notification"
                    >
                      <X className="h-5 w-5" />
                    </button>
                    <button className="text-gray-400 hover:text-white transition-colors">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Action buttons for specific notification types */}
                {notification.type === 'connection' && notification.unread && (
                  <div className="flex space-x-3 mt-4 pt-4 border-t border-gray-700">
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                      Accept
                    </button>
                    <button className="bg-gray-600 text-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-500 transition-colors">
                      Decline
                    </button>
                  </div>
                )}

                {notification.type === 'comment' && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <button className="text-purple-400 hover:text-purple-300 font-medium text-sm">
                      Reply to comment
                    </button>
                  </div>
                )}

                {notification.type === 'competition' && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors">
                      View Competition
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Bell className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No notifications found</h3>
              <p className="text-gray-500">
                {filter === 'all' 
                  ? "You don't have any notifications yet" 
                  : `No ${filter} notifications found`
                }
              </p>
            </div>
          )}
        </div>

        {/* Load More */}
        {filteredNotifications.length > 0 && (
          <div className="text-center mt-8">
            <button className="bg-gray-800 text-gray-300 px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700">
              Load More Notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;