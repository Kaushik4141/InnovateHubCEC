import React, { useState } from 'react';
import Header from './Header';
import { 
  Users, UserPlus, Search, Filter, MessageCircle, UserCheck, 
  Star, MapPin, Calendar, Award, Code, Brain, Palette, Cpu
} from 'lucide-react';

const Network = () => {
  const [activeTab, setActiveTab] = useState('connections');
  const [searchTerm, setSearchTerm] = useState('');

  const connections = [
    {
      id: 1,
      name: "Aditya Kumar",
      role: "Final Year CSE",
      specialization: "Full Stack Development",
      avatar: "AK",
      mutualConnections: 12,
      location: "Bangalore",
      connected: true,
      isOnline: true,
      lastActive: "2 hours ago",
      skills: ["React", "Node.js", "Python"],
      icon: Code
    },
    {
      id: 2,
      name: "Sneha Agarwal",
      role: "4th Year CSE",
      specialization: "Machine Learning",
      avatar: "SA",
      mutualConnections: 8,
      location: "Bangalore",
      connected: true,
      isOnline: false,
      lastActive: "1 day ago",
      skills: ["TensorFlow", "Python", "Data Science"],
      icon: Brain
    },
    {
      id: 3,
      name: "Priyanka Joshi",
      role: "4th Year IT",
      specialization: "UI/UX Design",
      avatar: "PJ",
      mutualConnections: 15,
      location: "Mumbai",
      connected: true,
      isOnline: true,
      lastActive: "30 min ago",
      skills: ["Figma", "Adobe XD", "Prototyping"],
      icon: Palette
    }
  ];

  const suggestions = [
    {
      id: 4,
      name: "Vikram Singh",
      role: "Final Year ECE",
      specialization: "IoT & Embedded Systems",
      avatar: "VS",
      mutualConnections: 5,
      location: "Bangalore",
      connected: false,
      reason: "Works in IoT Development",
      skills: ["Arduino", "Raspberry Pi", "C++"],
      icon: Cpu
    },
    {
      id: 5,
      name: "Kavya Reddy",
      role: "4th Year IT",
      specialization: "Mobile Development",
      avatar: "KR",
      mutualConnections: 7,
      location: "Hyderabad",
      connected: false,
      reason: "Similar interests in Mobile Dev",
      skills: ["React Native", "Flutter", "iOS"],
      icon: Code
    },
    {
      id: 6,
      name: "Rohit Sharma",
      role: "Final Year CSE",
      specialization: "Database Systems",
      avatar: "RS",
      mutualConnections: 3,
      location: "Bangalore",
      connected: false,
      reason: "Backend Development Expert",
      skills: ["MySQL", "MongoDB", "System Design"],
      icon: Code
    }
  ];

  const invitations = [
    {
      id: 7,
      name: "Arjun Mehta",
      role: "2nd Year CSE",
      specialization: "Web Development",
      avatar: "AM",
      mutualConnections: 2,
      location: "Bangalore",
      message: "Hi! I saw your React project and would love to connect and learn from you.",
      sentAt: "2 hours ago"
    },
    {
      id: 8,
      name: "Pooja Gupta",
      role: "3rd Year IT",
      specialization: "Data Science",
      avatar: "PG",
      mutualConnections: 4,
      location: "Delhi",
      message: "Hello! I'm working on a similar ML project and would appreciate your guidance.",
      sentAt: "1 day ago"
    }
  ];

  const handleConnect = (personId: number) => {
    // Handle connection logic
    console.log('Connecting to person:', personId);
  };

  const handleAcceptInvitation = (invitationId: number) => {
    // Handle accept invitation logic
    console.log('Accepting invitation:', invitationId);
  };

  const handleDeclineInvitation = (invitationId: number) => {
    // Handle decline invitation logic
    console.log('Declining invitation:', invitationId);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Network</h1>
          <p className="text-gray-400">Manage your connections and discover new people to connect with</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">89</p>
                <p className="text-sm text-gray-400">Connections</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center">
              <UserPlus className="h-8 w-8 text-green-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">12</p>
                <p className="text-sm text-gray-400">Pending Invitations</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">15</p>
                <p className="text-sm text-gray-400">Mentors</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-purple-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">8</p>
                <p className="text-sm text-gray-400">Mentees</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search your network..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                />
              </div>
            </div>
            <button className="flex items-center px-4 py-2 bg-gray-700 rounded-lg text-gray-300 hover:bg-gray-600 transition-colors">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 mb-8">
          <div className="flex border-b border-gray-700">
            <button 
              onClick={() => setActiveTab('connections')}
              className={`px-6 py-4 font-medium transition-colors ${activeTab === 'connections' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}
            >
              Connections ({connections.length})
            </button>
            <button 
              onClick={() => setActiveTab('suggestions')}
              className={`px-6 py-4 font-medium transition-colors ${activeTab === 'suggestions' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}
            >
              People You May Know ({suggestions.length})
            </button>
            <button 
              onClick={() => setActiveTab('invitations')}
              className={`px-6 py-4 font-medium transition-colors ${activeTab === 'invitations' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}
            >
              Invitations ({invitations.length})
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'connections' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {connections.map((person) => (
                  <div key={person.id} className="bg-gray-700 rounded-xl p-6 border border-gray-600 hover:border-purple-500 transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                          {person.avatar}
                        </div>
                        {person.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-700"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{person.name}</h3>
                        <p className="text-sm text-gray-400">{person.role}</p>
                        <p className="text-sm text-purple-400">{person.specialization}</p>
                      </div>
                      <person.icon className="h-5 w-5 text-gray-400" />
                    </div>

                    <div className="space-y-2 mb-4 text-sm text-gray-400">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {person.location}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        {person.mutualConnections} mutual connections
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {person.isOnline ? 'Online now' : `Last active ${person.lastActive}`}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {person.skills.slice(0, 3).map((skill) => (
                          <span key={skill} className="px-2 py-1 bg-purple-600 bg-opacity-20 text-purple-300 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </button>
                      <button className="bg-gray-600 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors">
                        <UserCheck className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'suggestions' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestions.map((person) => (
                  <div key={person.id} className="bg-gray-700 rounded-xl p-6 border border-gray-600 hover:border-purple-500 transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                        {person.avatar}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{person.name}</h3>
                        <p className="text-sm text-gray-400">{person.role}</p>
                        <p className="text-sm text-purple-400">{person.specialization}</p>
                      </div>
                      <person.icon className="h-5 w-5 text-gray-400" />
                    </div>

                    <div className="space-y-2 mb-4 text-sm text-gray-400">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {person.location}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        {person.mutualConnections} mutual connections
                      </div>
                      <p className="text-blue-400">{person.reason}</p>
                    </div>

                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {person.skills.slice(0, 3).map((skill) => (
                          <span key={skill} className="px-2 py-1 bg-purple-600 bg-opacity-20 text-purple-300 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => handleConnect(person.id)}
                      className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'invitations' && (
              <div className="space-y-6">
                {invitations.map((invitation) => (
                  <div key={invitation.id} className="bg-gray-700 rounded-xl p-6 border border-gray-600">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                          {invitation.avatar}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{invitation.name}</h3>
                          <p className="text-sm text-gray-400">{invitation.role}</p>
                          <p className="text-sm text-purple-400">{invitation.specialization}</p>
                          <div className="flex items-center mt-2 text-sm text-gray-400">
                            <MapPin className="h-4 w-4 mr-1" />
                            {invitation.location}
                            <Users className="h-4 w-4 ml-4 mr-1" />
                            {invitation.mutualConnections} mutual connections
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{invitation.sentAt}</span>
                    </div>

                    {invitation.message && (
                      <div className="mt-4 p-4 bg-gray-600 rounded-lg">
                        <p className="text-gray-300 text-sm italic">"{invitation.message}"</p>
                      </div>
                    )}

                    <div className="flex space-x-3 mt-4">
                      <button 
                        onClick={() => handleAcceptInvitation(invitation.id)}
                        className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => handleDeclineInvitation(invitation.id)}
                        className="bg-gray-600 text-gray-300 px-6 py-2 rounded-lg font-medium hover:bg-gray-500 transition-colors"
                      >
                        Decline
                      </button>
                      <button className="bg-gray-600 text-gray-300 px-6 py-2 rounded-lg font-medium hover:bg-gray-500 transition-colors flex items-center">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Network;