import React, { useState } from 'react';
import Header from './Header';
import { 
  Search, Plus, Phone, Video, MoreHorizontal, Send, Paperclip, 
  Smile, Users, Star, Circle, CheckCircle2, Archive, Trash2
} from 'lucide-react';

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState(1);
  const [newMessage, setNewMessage] = useState('');

  const conversations = [
    {
      id: 1,
      name: "Aditya Kumar",
      role: "Mentor - Full Stack Dev",
      avatar: "AK",
      lastMessage: "Great progress on your React project! Let's schedule a code review session.",
      timestamp: "2 min ago",
      unread: 2,
      online: true,
      type: "mentor"
    },
    {
      id: 2,
      name: "Study Group - AI/ML",
      role: "5 members",
      avatar: "SG",
      lastMessage: "Priya: Has anyone started working on the neural network assignment?",
      timestamp: "15 min ago",
      unread: 0,
      online: false,
      type: "group"
    },
    {
      id: 3,
      name: "Sneha Agarwal",
      role: "Mentor - Machine Learning",
      avatar: "SA",
      lastMessage: "The research paper you shared is excellent. We should discuss it in our next session.",
      timestamp: "1 hour ago",
      unread: 1,
      online: true,
      type: "mentor"
    },
    {
      id: 4,
      name: "Raj Patel",
      role: "3rd Year ECE",
      avatar: "RP",
      lastMessage: "Thanks for helping with the IoT project! The sensor integration is working perfectly now.",
      timestamp: "2 hours ago",
      unread: 0,
      online: false,
      type: "peer"
    },
    {
      id: 5,
      name: "Web Dev Team",
      role: "8 members",
      avatar: "WD",
      lastMessage: "Ananya: The new UI components are ready for review. Check the Figma file.",
      timestamp: "3 hours ago",
      unread: 3,
      online: false,
      type: "group"
    },
    {
      id: 6,
      name: "Priyanka Joshi",
      role: "Mentor - UI/UX Design",
      avatar: "PJ",
      lastMessage: "Your portfolio design is looking great! Just a few minor adjustments needed.",
      timestamp: "1 day ago",
      unread: 0,
      online: true,
      type: "mentor"
    }
  ];

  const messages = [
    {
      id: 1,
      sender: "Aditya Kumar",
      content: "Hey! How's the React project coming along?",
      timestamp: "10:30 AM",
      isOwn: false,
      avatar: "AK"
    },
    {
      id: 2,
      sender: "You",
      content: "It's going well! I've implemented the user authentication and working on the dashboard now.",
      timestamp: "10:32 AM",
      isOwn: true,
      avatar: "YU"
    },
    {
      id: 3,
      sender: "Aditya Kumar",
      content: "That's awesome! Are you using any state management library?",
      timestamp: "10:33 AM",
      isOwn: false,
      avatar: "AK"
    },
    {
      id: 4,
      sender: "You",
      content: "Yes, I'm using Redux Toolkit. It's making the state management much cleaner.",
      timestamp: "10:35 AM",
      isOwn: true,
      avatar: "YU"
    },
    {
      id: 5,
      sender: "Aditya Kumar",
      content: "Perfect choice! Redux Toolkit is definitely the way to go. Would you like me to review your code?",
      timestamp: "10:36 AM",
      isOwn: false,
      avatar: "AK"
    },
    {
      id: 6,
      sender: "You",
      content: "That would be amazing! I'll push the latest changes to GitHub and share the link.",
      timestamp: "10:38 AM",
      isOwn: true,
      avatar: "YU"
    },
    {
      id: 7,
      sender: "Aditya Kumar",
      content: "Great progress on your React project! Let's schedule a code review session.",
      timestamp: "10:40 AM",
      isOwn: false,
      avatar: "AK"
    }
  ];

  const selectedConversation = conversations.find(conv => conv.id === selectedChat);

  const getConversationTypeColor = (type: string) => {
    switch (type) {
      case 'mentor':
        return 'text-purple-400';
      case 'group':
        return 'text-blue-400';
      case 'peer':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Add message logic here
      setNewMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="flex h-full">
            {/* Conversations Sidebar */}
            <div className="w-1/3 border-r border-gray-700 flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Messages</h2>
                  <button className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors">
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedChat(conversation.id)}
                    className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors ${
                      selectedChat === conversation.id ? 'bg-gray-700 border-l-4 border-l-purple-500' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                          {conversation.avatar}
                        </div>
                        {conversation.online && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-800"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-white truncate">{conversation.name}</h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-400">{conversation.timestamp}</span>
                            {conversation.unread > 0 && (
                              <span className="bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {conversation.unread}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className={`text-sm ${getConversationTypeColor(conversation.type)} mb-1`}>
                          {conversation.role}
                        </p>
                        <p className="text-sm text-gray-400 truncate">{conversation.lastMessage}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-6 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                            {selectedConversation.avatar}
                          </div>
                          {selectedConversation.online && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-800"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{selectedConversation.name}</h3>
                          <p className={`text-sm ${getConversationTypeColor(selectedConversation.type)}`}>
                            {selectedConversation.role}
                          </p>
                          {selectedConversation.online && (
                            <p className="text-xs text-green-400">Active now</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <button className="text-gray-400 hover:text-white transition-colors">
                          <Phone className="h-5 w-5" />
                        </button>
                        <button className="text-gray-400 hover:text-white transition-colors">
                          <Video className="h-5 w-5" />
                        </button>
                        <button className="text-gray-400 hover:text-white transition-colors">
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${message.isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                            {message.avatar}
                          </div>
                          <div className={`px-4 py-2 rounded-lg ${
                            message.isOwn 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-gray-700 text-gray-300'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${message.isOwn ? 'text-purple-200' : 'text-gray-500'}`}>
                              {message.timestamp}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="p-6 border-t border-gray-700">
                    <div className="flex items-center space-x-3">
                      <button className="text-gray-400 hover:text-white transition-colors">
                        <Paperclip className="h-5 w-5" />
                      </button>
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Type a message..."
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                        />
                        <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                          <Smile className="h-5 w-5" />
                        </button>
                      </div>
                      <button 
                        onClick={handleSendMessage}
                        className="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!newMessage.trim()}
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">Select a conversation</h3>
                    <p className="text-gray-500">Choose a conversation from the sidebar to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;