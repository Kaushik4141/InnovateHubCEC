import React, { useState } from 'react';
import { 
  Trophy, Calendar, Users, Award, Clock, Target, Filter, Search, Plus,
  ExternalLink, Star, MapPin, DollarSign, Zap, Code, Brain, Palette
} from 'lucide-react';

const Competitions = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const competitions = [
    {
      id: 1,
      title: "AI Innovation Challenge 2024",
      organizer: "CampusConnect",
      description: "Build innovative AI solutions that can solve real-world problems. Focus on healthcare, education, or sustainability domains.",
      deadline: "2024-02-15",
      startDate: "2024-01-15",
      endDate: "2024-02-15",
      participants: 156,
      maxParticipants: 200,
      prize: "₹50,000",
      difficulty: "Advanced",
      category: "AI/ML",
      tags: ["AI/ML", "Deep Learning", "Computer Vision", "NLP"],
      status: "Open",
      featured: true,
      location: "Online",
      teamSize: "1-4 members",
      requirements: ["Python proficiency", "ML experience", "Portfolio submission"],
      image: "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=600",
      icon: Brain
    },
    {
      id: 2,
      title: "Web Development Hackathon",
      organizer: "Tech Club CEC",
      description: "48-hour hackathon to build innovative web applications. Theme: Digital Solutions for Campus Life.",
      deadline: "2024-01-20",
      startDate: "2024-01-25",
      endDate: "2024-01-27",
      participants: 89,
      maxParticipants: 120,
      prize: "₹25,000",
      difficulty: "Intermediate",
      category: "Web Development",
      tags: ["React", "Node.js", "Full Stack", "API Development"],
      status: "Open",
      featured: false,
      location: "CEC Campus",
      teamSize: "2-5 members",
      requirements: ["Web development skills", "Team registration", "Laptop required"],
      image: "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=600",
      icon: Code
    },
    {
      id: 3,
      title: "IoT Smart Solutions Contest",
      organizer: "IEEE CEC Student Branch",
      description: "Design and prototype IoT solutions for smart cities, homes, or industrial applications.",
      deadline: "2024-02-01",
      startDate: "2024-02-05",
      endDate: "2024-02-20",
      participants: 67,
      maxParticipants: 80,
      prize: "₹30,000",
      difficulty: "Advanced",
      category: "Hardware/IoT",
      tags: ["IoT", "Arduino", "Raspberry Pi", "Sensors"],
      status: "Open",
      featured: true,
      location: "Hybrid",
      teamSize: "2-4 members",
      requirements: ["Hardware knowledge", "Programming skills", "Prototype demo"],
      image: "https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=600",
      icon: Zap
    },
    {
      id: 4,
      title: "UI/UX Design Challenge",
      organizer: "Design Society",
      description: "Create user-centered designs for mobile applications. Focus on accessibility and user experience.",
      deadline: "2024-01-25",
      startDate: "2024-01-30",
      endDate: "2024-02-10",
      participants: 45,
      maxParticipants: 60,
      prize: "₹15,000",
      difficulty: "Beginner",
      category: "Design",
      tags: ["UI/UX", "Figma", "Prototyping", "User Research"],
      status: "Open",
      featured: false,
      location: "Online",
      teamSize: "1-3 members",
      requirements: ["Design portfolio", "Figma proficiency", "Presentation skills"],
      image: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=600",
      icon: Palette
    },
    {
      id: 5,
      title: "Data Science Olympics",
      organizer: "Analytics Club",
      description: "Analyze complex datasets and build predictive models. Real-world business problems from industry partners.",
      deadline: "2024-01-18",
      startDate: "2024-01-22",
      endDate: "2024-02-05",
      participants: 78,
      maxParticipants: 100,
      prize: "₹35,000",
      difficulty: "Intermediate",
      category: "Data Science",
      tags: ["Python", "Machine Learning", "Data Analysis", "Visualization"],
      status: "Closing Soon",
      featured: true,
      location: "Online",
      teamSize: "1-3 members",
      requirements: ["Python/R skills", "Statistics knowledge", "Jupyter notebook"],
      image: "https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=600",
      icon: Target
    },
    {
      id: 6,
      title: "Mobile App Development Sprint",
      organizer: "Mobile Dev Community",
      description: "Build cross-platform mobile applications addressing social issues or improving daily life.",
      deadline: "2024-01-15",
      startDate: "2024-01-20",
      endDate: "2024-02-03",
      participants: 34,
      maxParticipants: 50,
      prize: "₹20,000",
      difficulty: "Intermediate",
      category: "Mobile Development",
      tags: ["React Native", "Flutter", "Mobile UI", "API Integration"],
      status: "Closed",
      featured: false,
      location: "CEC Campus",
      teamSize: "2-4 members",
      requirements: ["Mobile dev experience", "App store deployment", "Demo video"],
      image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600",
      icon: Code
    }
  ];

  const categories = [
    { name: "All", value: "all", count: competitions.length },
    { name: "AI/ML", value: "AI/ML", count: competitions.filter(c => c.category === "AI/ML").length },
    { name: "Web Development", value: "Web Development", count: competitions.filter(c => c.category === "Web Development").length },
    { name: "Hardware/IoT", value: "Hardware/IoT", count: competitions.filter(c => c.category === "Hardware/IoT").length },
    { name: "Design", value: "Design", count: competitions.filter(c => c.category === "Design").length },
    { name: "Data Science", value: "Data Science", count: competitions.filter(c => c.category === "Data Science").length },
    { name: "Mobile Development", value: "Mobile Development", count: competitions.filter(c => c.category === "Mobile Development").length }
  ];

  const filteredCompetitions = competitions.filter(competition => {
    const matchesFilter = filter === 'all' || competition.category === filter;
    const matchesSearch = competition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         competition.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         competition.organizer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-green-600 bg-opacity-20 text-green-300 border-green-500';
      case 'Closing Soon':
        return 'bg-yellow-600 bg-opacity-20 text-yellow-300 border-yellow-500';
      case 'Closed':
        return 'bg-red-600 bg-opacity-20 text-red-300 border-red-500';
      default:
        return 'bg-gray-600 bg-opacity-20 text-gray-300 border-gray-500';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-blue-600 bg-opacity-20 text-blue-300';
      case 'Intermediate':
        return 'bg-purple-600 bg-opacity-20 text-purple-300';
      case 'Advanced':
        return 'bg-red-600 bg-opacity-20 text-red-300';
      default:
        return 'bg-gray-600 bg-opacity-20 text-gray-300';
    }
  };

  const getDaysLeft = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Competitions</h2>
          <p className="text-gray-400">Challenge yourself and showcase your skills</p>
        </div>
        <button className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Create Competition
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
                placeholder="Search competitions, organizers, or technologies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
              />
            </div>
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setFilter(category.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === category.value
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Competitions */}
      {filter === 'all' && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Star className="h-5 w-5 mr-2 text-yellow-400" />
            Featured Competitions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {competitions.filter(c => c.featured).slice(0, 3).map((competition) => (
              <div key={competition.id} className="bg-gray-700 rounded-lg p-4 border border-yellow-500 border-opacity-30">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-1 bg-yellow-600 bg-opacity-20 text-yellow-300 rounded text-xs font-medium">
                    Featured
                  </span>
                  <competition.icon className="h-5 w-5 text-gray-400" />
                </div>
                <h4 className="font-semibold text-white mb-1">{competition.title}</h4>
                <p className="text-sm text-gray-400 mb-2">{competition.organizer}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {competition.prize}
                  </span>
                  <span className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {competition.participants}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Competitions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCompetitions.map((competition) => (
          <div key={competition.id} className="bg-gray-800 rounded-xl border border-gray-700 hover:border-purple-500 transition-all duration-300 overflow-hidden">
            {/* Competition Image */}
            <div className="relative h-48 overflow-hidden">
              <img 
                src={competition.image} 
                alt={competition.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(competition.status)}`}>
                  {competition.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(competition.difficulty)}`}>
                  {competition.difficulty}
                </span>
              </div>
              {competition.featured && (
                <div className="absolute top-4 right-4">
                  <Star className="h-6 w-6 text-yellow-400 fill-current" />
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 rounded-lg px-3 py-1">
                <span className="text-white font-semibold text-lg">{competition.prize}</span>
              </div>
            </div>
            
            <div className="p-6">
              {/* Competition Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-1">{competition.title}</h3>
                  <p className="text-purple-400 font-medium">{competition.organizer}</p>
                </div>
                <competition.icon className="h-6 w-6 text-gray-400 flex-shrink-0 ml-2" />
              </div>
              
              {/* Description */}
              <p className="text-gray-300 mb-4 line-clamp-2 leading-relaxed">{competition.description}</p>
              
              {/* Competition Details */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="flex items-center text-gray-400">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{getDaysLeft(competition.deadline)} days left</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{competition.participants}/{competition.maxParticipants}</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{competition.location}</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Target className="h-4 w-4 mr-2" />
                  <span>{competition.teamSize}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {competition.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-gray-700 text-gray-300 rounded-md text-xs">
                    {tag}
                  </span>
                ))}
                {competition.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded-md text-xs">
                    +{competition.tags.length - 3} more
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Participants</span>
                  <span>{competition.participants}/{competition.maxParticipants}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                    style={{width: `${(competition.participants / competition.maxParticipants) * 100}%`}}
                  ></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  {competition.status === 'Open' ? (
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center text-sm">
                      <Trophy className="h-4 w-4 mr-2" />
                      Participate
                    </button>
                  ) : competition.status === 'Closing Soon' ? (
                    <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2" />
                      Register Now
                    </button>
                  ) : (
                    <button className="bg-gray-600 text-gray-300 px-4 py-2 rounded-lg font-medium cursor-not-allowed flex items-center text-sm" disabled>
                      <Clock className="h-4 w-4 mr-2" />
                      Registration Closed
                    </button>
                  )}
                  <button className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center text-sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Details
                  </button>
                </div>
              </div>

              {/* Requirements */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Requirements:</h4>
                <ul className="text-xs text-gray-500 space-y-1">
                  {competition.requirements.slice(0, 2).map((req, index) => (
                    <li key={index} className="flex items-center">
                      <div className="w-1 h-1 bg-purple-400 rounded-full mr-2"></div>
                      {req}
                    </li>
                  ))}
                  {competition.requirements.length > 2 && (
                    <li className="text-purple-400 cursor-pointer hover:text-purple-300">
                      +{competition.requirements.length - 2} more requirements
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {filteredCompetitions.length > 0 && (
        <div className="text-center">
          <button className="bg-gray-800 text-gray-300 px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700">
            Load More Competitions
          </button>
        </div>
      )}

      {/* No Results */}
      {filteredCompetitions.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No competitions found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default Competitions;