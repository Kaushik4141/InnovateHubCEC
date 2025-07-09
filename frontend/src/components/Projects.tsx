import React, { useState } from 'react';
import { 
  ExternalLink, Star, Users, Code, Cpu, Palette, Brain, Database, Smartphone,
  Filter, Search, Plus, Eye, Heart, MessageCircle, Calendar, Award
} from 'lucide-react';

const Projects = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const projects = [
    {
      id: 1,
      title: "AI-Powered Study Assistant",
      description: "An intelligent tutoring system that adapts to individual learning styles using machine learning algorithms. Features include personalized content delivery, progress tracking, and automated assessment generation.",
      author: "Priya Sharma",
      year: "Final Year CSE",
      likes: 45,
      views: 234,
      comments: 12,
      domain: "AI/ML",
      tags: ["Python", "TensorFlow", "NLP", "React", "MongoDB"],
      icon: Brain,
      image: "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400",
      status: "Completed",
      github: "https://github.com",
      demo: "https://demo.com",
      featured: true,
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      title: "IoT Smart Campus System",
      description: "A comprehensive IoT solution for energy management, security, and automation across campus facilities. Includes real-time monitoring, automated controls, and predictive maintenance.",
      author: "Raj Patel",
      year: "3rd Year ECE",
      likes: 38,
      views: 189,
      comments: 8,
      domain: "Hardware/IoT",
      tags: ["Arduino", "Raspberry Pi", "Node.js", "MQTT", "React"],
      icon: Cpu,
      image: "https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400",
      status: "In Progress",
      github: "https://github.com",
      demo: null,
      featured: false,
      createdAt: "2024-01-10"
    },
    {
      id: 3,
      title: "Collaborative Code Editor",
      description: "Real-time collaborative coding platform with integrated chat, code sharing, and version control. Supports multiple programming languages with syntax highlighting and auto-completion.",
      author: "Ananya Gupta",
      year: "4th Year IT",
      likes: 52,
      views: 312,
      comments: 15,
      domain: "Web Development",
      tags: ["React", "Node.js", "Socket.io", "MongoDB", "TypeScript"],
      icon: Code,
      image: "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=400",
      status: "Completed",
      github: "https://github.com",
      demo: "https://demo.com",
      featured: true,
      createdAt: "2024-01-08"
    },
    {
      id: 4,
      title: "Sustainable Design Portfolio",
      description: "A collection of eco-friendly product designs with detailed sustainability impact analysis. Includes 3D models, material studies, and environmental impact assessments.",
      author: "Karthik Reddy",
      year: "2nd Year Design",
      likes: 29,
      views: 156,
      comments: 6,
      domain: "Design",
      tags: ["Figma", "3D Modeling", "Sustainability", "UX Research"],
      icon: Palette,
      image: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=400",
      status: "Completed",
      github: null,
      demo: "https://demo.com",
      featured: false,
      createdAt: "2024-01-05"
    },
    {
      id: 5,
      title: "Campus Food Delivery App",
      description: "Mobile application for ordering food from campus cafeterias and restaurants. Features real-time tracking, payment integration, and user reviews.",
      author: "Kavya Singh",
      year: "3rd Year IT",
      likes: 41,
      views: 278,
      comments: 10,
      domain: "Mobile Development",
      tags: ["React Native", "Firebase", "Stripe", "Google Maps"],
      icon: Smartphone,
      image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400",
      status: "In Progress",
      github: "https://github.com",
      demo: null,
      featured: false,
      createdAt: "2024-01-03"
    },
    {
      id: 6,
      title: "Student Performance Analytics",
      description: "Data analytics platform for tracking and analyzing student performance across different subjects and semesters. Provides insights for academic improvement.",
      author: "Arjun Mehta",
      year: "Final Year CSE",
      likes: 33,
      views: 201,
      comments: 7,
      domain: "Data Science",
      tags: ["Python", "Pandas", "Plotly", "SQL", "Streamlit"],
      icon: Database,
      image: "https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=400",
      status: "Completed",
      github: "https://github.com",
      demo: "https://demo.com",
      featured: true,
      createdAt: "2024-01-01"
    }
  ];

  const domains = [
    { name: "All", value: "all", count: projects.length },
    { name: "AI/ML", value: "AI/ML", count: projects.filter(p => p.domain === "AI/ML").length },
    { name: "Web Development", value: "Web Development", count: projects.filter(p => p.domain === "Web Development").length },
    { name: "Hardware/IoT", value: "Hardware/IoT", count: projects.filter(p => p.domain === "Hardware/IoT").length },
    { name: "Mobile Development", value: "Mobile Development", count: projects.filter(p => p.domain === "Mobile Development").length },
    { name: "Design", value: "Design", count: projects.filter(p => p.domain === "Design").length },
    { name: "Data Science", value: "Data Science", count: projects.filter(p => p.domain === "Data Science").length }
  ];

  const filteredProjects = projects.filter(project => {
    const matchesFilter = filter === 'all' || project.domain === filter;
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getDomainColor = (domain: string) => {
    const colors: Record<string, string> = {
      "AI/ML": "bg-purple-100 text-purple-800 border-purple-200",
      "Hardware/IoT": "bg-blue-100 text-blue-800 border-blue-200",
      "Web Development": "bg-green-100 text-green-800 border-green-200",
      "Design": "bg-pink-100 text-pink-800 border-pink-200",
      "Mobile Development": "bg-indigo-100 text-indigo-800 border-indigo-200",
      "Data Science": "bg-yellow-100 text-yellow-800 border-yellow-200"
    };
    return colors[domain] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusColor = (status: string) => {
    return status === 'Completed' 
      ? 'bg-green-600 bg-opacity-20 text-green-300 border-green-500' 
      : 'bg-yellow-600 bg-opacity-20 text-yellow-300 border-yellow-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Projects Showcase</h2>
          <p className="text-gray-400">Discover innovative work from your fellow students</p>
        </div>
        <button className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Share Project
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects, technologies, or authors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
              />
            </div>
          </div>
          
          {/* Domain Filter */}
          <div className="flex flex-wrap gap-2">
            {domains.map((domain) => (
              <button
                key={domain.value}
                onClick={() => setFilter(domain.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === domain.value
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {domain.name} ({domain.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Projects */}
      {filter === 'all' && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Award className="h-5 w-5 mr-2 text-yellow-400" />
            Featured Projects
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.filter(p => p.featured).slice(0, 3).map((project) => (
              <div key={project.id} className="bg-gray-700 rounded-lg p-4 border border-yellow-500 border-opacity-30">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-1 bg-yellow-600 bg-opacity-20 text-yellow-300 rounded text-xs font-medium">
                    Featured
                  </span>
                  <project.icon className="h-5 w-5 text-gray-400" />
                </div>
                <h4 className="font-semibold text-white mb-1">{project.title}</h4>
                <p className="text-sm text-gray-400 mb-2">{project.author}</p>
                <div className="flex items-center text-xs text-gray-500">
                  <Heart className="h-3 w-3 mr-1" />
                  <span>{project.likes}</span>
                  <Eye className="h-3 w-3 ml-3 mr-1" />
                  <span>{project.views}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-gray-800 rounded-xl border border-gray-700 hover:border-purple-500 transition-all duration-300 overflow-hidden">
            {/* Project Image */}
            <div className="relative h-48 overflow-hidden">
              <img 
                src={project.image} 
                alt={project.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDomainColor(project.domain)}`}>
                  {project.domain}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              {project.featured && (
                <div className="absolute top-4 right-4">
                  <Award className="h-6 w-6 text-yellow-400" />
                </div>
              )}
            </div>
            
            <div className="p-6">
              {/* Project Header */}
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-white mb-2 flex-1">{project.title}</h3>
                <project.icon className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" />
              </div>
              
              {/* Description */}
              <p className="text-gray-300 mb-4 line-clamp-3 leading-relaxed">{project.description}</p>
              
              {/* Author Info */}
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                  {project.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-medium text-white">{project.author}</p>
                  <p className="text-sm text-gray-400">{project.year}</p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-gray-700 text-gray-300 rounded-md text-xs hover:bg-purple-600 hover:text-white cursor-pointer transition-colors">
                    {tag}
                  </span>
                ))}
                {project.tags.length > 4 && (
                  <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded-md text-xs">
                    +{project.tags.length - 4} more
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <Heart className="h-4 w-4 mr-1" />
                    {project.likes}
                  </span>
                  <span className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {project.views}
                  </span>
                  <span className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {project.comments}
                  </span>
                </div>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  {project.demo && (
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center text-sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Live Demo
                    </button>
                  )}
                  {project.github && (
                    <button className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center text-sm">
                      <Code className="h-4 w-4 mr-2" />
                      Code
                    </button>
                  )}
                </div>
                <button className="text-purple-400 hover:text-purple-300 font-medium text-sm">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {filteredProjects.length > 0 && (
        <div className="text-center">
          <button className="bg-gray-800 text-gray-300 px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700">
            Load More Projects
          </button>
        </div>
      )}

      {/* No Results */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <Code className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No projects found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default Projects;