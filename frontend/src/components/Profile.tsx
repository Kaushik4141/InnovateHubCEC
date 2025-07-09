import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { 
  Edit, MapPin, Calendar, Mail, Phone, Github, Linkedin, Globe,
  Award, Star, Eye, Heart, MessageCircle, Code, Trophy, Users,
  Plus, Settings, Share2, Bookmark, ExternalLink
} from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('about');

  const userProfile = {
    name: "Your Name",
    year: "3rd Year CSE",
    college: "Canara Engineering College",
    location: "Bangalore, India",
    joinedDate: "January 2023",
    email: "your.email@cec.edu.in",
    phone: "+91 98765 43210",
    bio: "Passionate computer science student with a keen interest in full-stack development and artificial intelligence. Love building innovative solutions and contributing to open-source projects.",
    skills: ["React", "Node.js", "Python", "Machine Learning", "MongoDB", "AWS", "TypeScript", "Docker"],
    interests: ["Web Development", "AI/ML", "Open Source", "Competitive Programming"],
    achievements: ["Best Project Award 2023", "Hackathon Winner", "Dean's List"],
    socialLinks: {
      github: "https://github.com/yourusername",
      linkedin: "https://linkedin.com/in/yourusername",
      portfolio: "https://yourportfolio.com"
    },
    stats: {
      profileViews: 127,
      projects: 5,
      connections: 89,
      mentees: 3,
      competitions: 2,
      posts: 12
    }
  };

  const projects = [
    {
      id: 1,
      title: "AI Study Assistant",
      description: "Intelligent tutoring system using NLP and machine learning",
      image: "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400",
      tags: ["Python", "TensorFlow", "React"],
      likes: 24,
      views: 156,
      status: "Completed"
    },
    {
      id: 2,
      title: "Campus Food Delivery",
      description: "Mobile app for ordering food from campus restaurants",
      image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400",
      tags: ["React Native", "Firebase"],
      likes: 18,
      views: 89,
      status: "In Progress"
    }
  ];

  const posts = [
    {
      id: 1,
      content: "Just completed my AI study assistant project! Looking for feedback from the community.",
      timestamp: "2 hours ago",
      likes: 15,
      comments: 8,
      type: "project"
    },
    {
      id: 2,
      content: "Excited to share that I'll be mentoring junior students in web development!",
      timestamp: "1 day ago",
      likes: 23,
      comments: 12,
      type: "announcement"
    }
  ];

  const connections = [
    { name: "Priya Sharma", role: "Final Year CSE", avatar: "PS" },
    { name: "Raj Patel", role: "3rd Year ECE", avatar: "RP" },
    { name: "Ananya Gupta", role: "4th Year IT", avatar: "AG" }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Profile Header */}
        <div className="bg-gray-800 rounded-xl p-8 mb-6 border border-gray-700">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
            <div className="flex items-center mb-6 lg:mb-0">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mr-6">
                YU
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{userProfile.name}</h1>
                <p className="text-lg text-purple-400 mb-1">{userProfile.year}</p>
                <p className="text-gray-400 mb-2">{userProfile.college}</p>
                <div className="flex items-center text-gray-400 text-sm space-x-4">
                  <span className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {userProfile.location}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined {userProfile.joinedDate}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
              <button className="bg-gray-700 text-gray-300 px-6 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </button>
              <button className="bg-gray-700 text-gray-300 p-2 rounded-lg hover:bg-gray-600 transition-colors">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-8 pt-6 border-t border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">{userProfile.stats.profileViews}</p>
              <p className="text-sm text-gray-400">Profile Views</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{userProfile.stats.projects}</p>
              <p className="text-sm text-gray-400">Projects</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{userProfile.stats.connections}</p>
              <p className="text-sm text-gray-400">Connections</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">{userProfile.stats.mentees}</p>
              <p className="text-sm text-gray-400">Mentees</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">{userProfile.stats.competitions}</p>
              <p className="text-sm text-gray-400">Competitions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-400">{userProfile.stats.posts}</p>
              <p className="text-sm text-gray-400">Posts</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* About */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">About</h3>
              <p className="text-gray-300 mb-4 leading-relaxed">{userProfile.bio}</p>
              
              <div className="space-y-3">
                <div className="flex items-center text-gray-400">
                  <Mail className="h-4 w-4 mr-3" />
                  <span className="text-sm">{userProfile.email}</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Phone className="h-4 w-4 mr-3" />
                  <span className="text-sm">{userProfile.phone}</span>
                </div>
              </div>

              <div className="flex space-x-3 mt-4">
                <a href={userProfile.socialLinks.github} className="text-gray-400 hover:text-white transition-colors">
                  <Github className="h-5 w-5" />
                </a>
                <a href={userProfile.socialLinks.linkedin} className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href={userProfile.socialLinks.portfolio} className="text-gray-400 hover:text-white transition-colors">
                  <Globe className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {userProfile.skills.map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-purple-600 bg-opacity-20 text-purple-300 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Achievements</h3>
              <div className="space-y-3">
                {userProfile.achievements.map((achievement) => (
                  <div key={achievement} className="flex items-center">
                    <Award className="h-4 w-4 text-yellow-400 mr-3" />
                    <span className="text-gray-300 text-sm">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Connections */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Connections</h3>
                <button 
                  onClick={() => navigate('/network')}
                  className="text-purple-400 text-sm hover:text-purple-300"
                >
                  View all
                </button>
              </div>
              <div className="space-y-3">
                {connections.map((connection) => (
                  <div key={connection.name} className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                      {connection.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{connection.name}</p>
                      <p className="text-xs text-gray-400">{connection.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 mb-6">
              <div className="flex border-b border-gray-700">
                <button 
                  onClick={() => setActiveTab('about')}
                  className={`px-6 py-4 font-medium transition-colors ${activeTab === 'about' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}
                >
                  Posts
                </button>
                <button 
                  onClick={() => setActiveTab('projects')}
                  className={`px-6 py-4 font-medium transition-colors ${activeTab === 'projects' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}
                >
                  Projects
                </button>
                <button 
                  onClick={() => setActiveTab('activity')}
                  className={`px-6 py-4 font-medium transition-colors ${activeTab === 'activity' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}
                >
                  Activity
                </button>
              </div>

              <div className="p-6">
                {activeTab === 'about' && (
                  <div className="space-y-6">
                    {/* Create Post */}
                    <div className="border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                          YU
                        </div>
                        <input
                          type="text"
                          placeholder="Share an update..."
                          className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-4">
                          <button className="text-gray-400 hover:text-purple-400 transition-colors">
                            <Code className="h-5 w-5" />
                          </button>
                          <button className="text-gray-400 hover:text-purple-400 transition-colors">
                            <Trophy className="h-5 w-5" />
                          </button>
                        </div>
                        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                          Post
                        </button>
                      </div>
                    </div>

                    {/* Posts */}
                    {posts.map((post) => (
                      <div key={post.id} className="border border-gray-700 rounded-lg p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                            YU
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">{userProfile.name}</h4>
                            <p className="text-sm text-gray-400">{post.timestamp}</p>
                          </div>
                        </div>
                        <p className="text-gray-300 mb-4">{post.content}</p>
                        <div className="flex items-center space-x-6 text-gray-400">
                          <button className="flex items-center hover:text-red-400 transition-colors">
                            <Heart className="h-4 w-4 mr-1" />
                            {post.likes}
                          </button>
                          <button className="flex items-center hover:text-blue-400 transition-colors">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            {post.comments}
                          </button>
                          <button className="flex items-center hover:text-green-400 transition-colors">
                            <Share2 className="h-4 w-4 mr-1" />
                            Share
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'projects' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-white">My Projects</h3>
                      <button className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Project
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {projects.map((project) => (
                        <div key={project.id} className="border border-gray-700 rounded-lg overflow-hidden">
                          <img src={project.image} alt={project.title} className="w-full h-48 object-cover" />
                          <div className="p-4">
                            <h4 className="font-semibold text-white mb-2">{project.title}</h4>
                            <p className="text-gray-400 text-sm mb-3">{project.description}</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {project.tags.map((tag) => (
                                <span key={tag} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm text-gray-400">
                                <span className="flex items-center">
                                  <Heart className="h-4 w-4 mr-1" />
                                  {project.likes}
                                </span>
                                <span className="flex items-center">
                                  <Eye className="h-4 w-4 mr-1" />
                                  {project.views}
                                </span>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs ${project.status === 'Completed' ? 'bg-green-600 bg-opacity-20 text-green-300' : 'bg-yellow-600 bg-opacity-20 text-yellow-300'}`}>
                                {project.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
                    <div className="space-y-4">
                      <div className="flex items-center p-4 border border-gray-700 rounded-lg">
                        <Trophy className="h-8 w-8 text-yellow-400 mr-4" />
                        <div>
                          <p className="text-white font-medium">Won AI Innovation Challenge</p>
                          <p className="text-gray-400 text-sm">2 days ago</p>
                        </div>
                      </div>
                      <div className="flex items-center p-4 border border-gray-700 rounded-lg">
                        <Code className="h-8 w-8 text-blue-400 mr-4" />
                        <div>
                          <p className="text-white font-medium">Published new project: AI Study Assistant</p>
                          <p className="text-gray-400 text-sm">1 week ago</p>
                        </div>
                      </div>
                      <div className="flex items-center p-4 border border-gray-700 rounded-lg">
                        <Users className="h-8 w-8 text-green-400 mr-4" />
                        <div>
                          <p className="text-white font-medium">Connected with 5 new mentors</p>
                          <p className="text-gray-400 text-sm">2 weeks ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;