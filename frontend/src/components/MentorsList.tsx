import { useState } from 'react';
import { 
  MessageCircle, Star, Award, Code, Cpu, Palette, Brain, Database, Smartphone,
  Search, Users, Calendar, Video, Phone
} from 'lucide-react';

const MentorsList = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');

  const mentors = [
    {
      id: 1,
      name: "Aditya Kumar",
      year: "Final Year CSE",
      specialization: "Full Stack Development",
      bio: "Passionate about building scalable web applications and mentoring junior developers. 3+ years of experience in React, Node.js, and cloud technologies.",
      skills: ["React", "Node.js", "Python", "AWS", "MongoDB", "TypeScript"],
      rating: 4.9,
      totalReviews: 45,
      mentees: 15,
      projects: 8,
      sessionsCompleted: 120,
      responseTime: "< 2 hours",
      icon: Code,
      avatar: "AK",
      available: true,
      nextAvailable: "Today 3:00 PM",
      hourlyRate: "Free",
      languages: ["English", "Hindi"],
      achievements: ["Best Mentor 2023", "Top Contributor"],
      experience: "3+ years",
      company: "Tech Startup Intern",
      location: "Bangalore",
      joinedDate: "2023-01-15",
      sessionTypes: ["1-on-1", "Group", "Code Review"],
      expertise: ["Web Development", "System Design", "Career Guidance"]
    },
    {
      id: 2,
      name: "Sneha Agarwal",
      year: "4th Year CSE",
      specialization: "Machine Learning & AI",
      bio: "ML enthusiast with research experience in computer vision and NLP. Published 2 papers and worked on industry projects.",
      skills: ["TensorFlow", "PyTorch", "Python", "Data Science", "OpenCV", "Scikit-learn"],
      rating: 4.8,
      totalReviews: 32,
      mentees: 12,
      projects: 6,
      sessionsCompleted: 89,
      responseTime: "< 4 hours",
      icon: Brain,
      avatar: "SA",
      available: false,
      nextAvailable: "Tomorrow 10:00 AM",
      hourlyRate: "Free",
      languages: ["English", "Hindi"],
      achievements: ["Research Excellence", "AI Competition Winner"],
      experience: "2+ years",
      company: "Research Lab",
      location: "Bangalore",
      joinedDate: "2023-02-20",
      sessionTypes: ["1-on-1", "Research Guidance"],
      expertise: ["Machine Learning", "Research", "Data Analysis"]
    },
    {
      id: 3,
      name: "Vikram Singh",
      year: "Final Year ECE",
      specialization: "IoT & Embedded Systems",
      bio: "Hardware enthusiast with expertise in IoT solutions and embedded programming. Built 10+ IoT projects for smart campus initiatives.",
      skills: ["Arduino", "Raspberry Pi", "C++", "PCB Design", "MQTT", "Sensors"],
      rating: 4.7,
      totalReviews: 28,
      mentees: 10,
      projects: 12,
      sessionsCompleted: 67,
      responseTime: "< 6 hours",
      icon: Cpu,
      avatar: "VS",
      available: true,
      nextAvailable: "Today 5:00 PM",
      hourlyRate: "Free",
      languages: ["English", "Hindi", "Punjabi"],
      achievements: ["IoT Innovation Award", "Best Project 2023"],
      experience: "2+ years",
      company: "Hardware Startup",
      location: "Bangalore",
      joinedDate: "2023-03-10",
      sessionTypes: ["1-on-1", "Project Review", "Hardware Demo"],
      expertise: ["IoT Development", "Hardware Design", "Embedded Systems"]
    },
    {
      id: 4,
      name: "Priyanka Joshi",
      year: "4th Year IT",
      specialization: "UI/UX Design",
      bio: "Creative designer focused on user-centered design and accessibility. Worked with 5+ startups on product design and user research.",
      skills: ["Figma", "Adobe XD", "Prototyping", "User Research", "Design Systems", "Sketch"],
      rating: 4.9,
      totalReviews: 41,
      mentees: 18,
      projects: 15,
      sessionsCompleted: 156,
      responseTime: "< 1 hour",
      icon: Palette,
      avatar: "PJ",
      available: true,
      nextAvailable: "Today 2:00 PM",
      hourlyRate: "Free",
      languages: ["English", "Hindi", "Marathi"],
      achievements: ["Design Excellence", "User Choice Award"],
      experience: "3+ years",
      company: "Design Agency",
      location: "Mumbai",
      joinedDate: "2022-12-05",
      sessionTypes: ["1-on-1", "Portfolio Review", "Design Critique"],
      expertise: ["UI/UX Design", "Product Design", "User Research"]
    },
    {
      id: 5,
      name: "Rohit Sharma",
      year: "Final Year CSE",
      specialization: "Database Systems & Backend",
      bio: "Backend specialist with deep knowledge of database optimization and system architecture. Experienced in building high-performance APIs.",
      skills: ["MySQL", "MongoDB", "PostgreSQL", "System Design", "Redis", "Docker"],
      rating: 4.6,
      totalReviews: 23,
      mentees: 8,
      projects: 5,
      sessionsCompleted: 45,
      responseTime: "< 8 hours",
      icon: Database,
      avatar: "RS",
      available: false,
      nextAvailable: "Monday 11:00 AM",
      hourlyRate: "Free",
      languages: ["English", "Hindi"],
      achievements: ["Database Expert", "Performance Optimization"],
      experience: "2+ years",
      company: "Enterprise Software",
      location: "Bangalore",
      joinedDate: "2023-04-18",
      sessionTypes: ["1-on-1", "System Design", "Code Review"],
      expertise: ["Database Design", "Backend Development", "System Architecture"]
    },
    {
      id: 6,
      name: "Kavya Reddy",
      year: "4th Year IT",
      specialization: "Mobile Development",
      bio: "Mobile app developer with expertise in cross-platform development. Published 3 apps on app stores with 10k+ downloads.",
      skills: ["React Native", "Flutter", "iOS", "Android", "Firebase", "API Integration"],
      rating: 4.8,
      totalReviews: 36,
      mentees: 14,
      projects: 9,
      sessionsCompleted: 98,
      responseTime: "< 3 hours",
      icon: Smartphone,
      avatar: "KR",
      available: true,
      nextAvailable: "Today 4:00 PM",
      hourlyRate: "Free",
      languages: ["English", "Hindi", "Telugu"],
      achievements: ["App Store Featured", "Mobile Innovation"],
      experience: "2+ years",
      company: "Mobile App Startup",
      location: "Hyderabad",
      joinedDate: "2023-01-30",
      sessionTypes: ["1-on-1", "App Review", "Publishing Guidance"],
      expertise: ["Mobile Development", "App Store Optimization", "Cross-platform"]
    }
  ];

  const specializations = [
    { name: "All", value: "all", count: mentors.length },
    { name: "Full Stack Development", value: "Full Stack Development", count: mentors.filter(m => m.specialization.includes("Full Stack")).length },
    { name: "Machine Learning & AI", value: "Machine Learning & AI", count: mentors.filter(m => m.specialization.includes("Machine Learning")).length },
    { name: "IoT & Embedded Systems", value: "IoT & Embedded Systems", count: mentors.filter(m => m.specialization.includes("IoT")).length },
    { name: "UI/UX Design", value: "UI/UX Design", count: mentors.filter(m => m.specialization.includes("UI/UX")).length },
    { name: "Mobile Development", value: "Mobile Development", count: mentors.filter(m => m.specialization.includes("Mobile")).length },
    { name: "Database Systems", value: "Database Systems", count: mentors.filter(m => m.specialization.includes("Database")).length }
  ];

  const filteredMentors = mentors.filter(mentor => {
    const matchesSpecialization = filter === 'all' || mentor.specialization.includes(filter);
    const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesAvailability = availabilityFilter === 'all' || 
                               (availabilityFilter === 'available' && mentor.available) ||
                               (availabilityFilter === 'unavailable' && !mentor.available);
    return matchesSpecialization && matchesSearch && matchesAvailability;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Find Mentors</h2>
          <p className="text-gray-400">Connect with experienced seniors for guidance and support</p>
        </div>
        <button className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors">
          Become a Mentor
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
                placeholder="Search mentors by name, skills, or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
              />
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Availability</option>
              <option value="available">Available Now</option>
              <option value="unavailable">Busy</option>
            </select>
          </div>
        </div>
        
        {/* Specialization Filter */}
        <div className="flex gap-2 overflow-x-auto flex-nowrap sm:flex-wrap pb-1 mt-4">
          {specializations.map((spec) => (
            <button
              key={spec.value}
              onClick={() => setFilter(spec.value)}
              className={`shrink-0 px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                filter === spec.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {spec.name} ({spec.count})
            </button>
          ))}
        </div>
      </div>

      {/* Top Mentors */}
      {filter === 'all' && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Award className="h-5 w-5 mr-2 text-yellow-400" />
            Top Rated Mentors
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mentors.filter(m => m.rating >= 4.8).slice(0, 3).map((mentor) => (
              <div key={mentor.id} className="bg-gray-700 rounded-lg p-4 border border-yellow-500 border-opacity-30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                      {mentor.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm">{mentor.name}</h4>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-400 ml-1">{mentor.rating}</span>
                      </div>
                    </div>
                  </div>
                  <mentor.icon className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-400">{mentor.specialization}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMentors.map((mentor) => (
          <div key={mentor.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300">
            {/* Mentor Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  {mentor.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="text-lg font-semibold text-white">{mentor.name}</h3>
                    {mentor.available && (
                      <div className="w-3 h-3 bg-green-400 rounded-full ml-2"></div>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{mentor.year}</p>
                  <div className="flex items-center mt-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-300 ml-1">{mentor.rating}</span>
                    <span className="text-sm text-gray-500 ml-1">({mentor.totalReviews} reviews)</span>
                  </div>
                </div>
              </div>
              <mentor.icon className="h-6 w-6 text-gray-400 flex-shrink-0" />
            </div>

            {/* Specialization */}
            <div className="mb-4">
              <h4 className="font-medium text-purple-400 mb-2">{mentor.specialization}</h4>
              <p className="text-gray-300 text-sm leading-relaxed">{mentor.bio}</p>
            </div>

            {/* Skills */}
            <div className="mb-4">
              <h5 className="text-sm font-medium text-gray-400 mb-2">Skills:</h5>
              <div className="flex flex-wrap gap-2">
                {mentor.skills.slice(0, 4).map((skill) => (
                  <span key={skill} className="px-2 py-1 bg-purple-600 bg-opacity-20 text-purple-300 rounded text-xs">
                    {skill}
                  </span>
                ))}
                {mentor.skills.length > 4 && (
                  <span className="px-2 py-1 bg-gray-700 text-gray-400 rounded text-xs">
                    +{mentor.skills.length - 4} more
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 text-center">
              <div className="bg-gray-700 rounded-lg p-3">
                <p className="text-lg font-semibold text-white">{mentor.mentees}</p>
                <p className="text-xs text-gray-400">Mentees</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <p className="text-lg font-semibold text-white">{mentor.projects}</p>
                <p className="text-xs text-gray-400">Projects</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <p className="text-lg font-semibold text-white">{mentor.sessionsCompleted}</p>
                <p className="text-xs text-gray-400">Sessions</p>
              </div>
            </div>

            {/* Availability & Details */}
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Response Time:</span>
                <span className="text-gray-300">{mentor.responseTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Next Available:</span>
                <span className={`${mentor.available ? 'text-green-400' : 'text-yellow-400'}`}>
                  {mentor.nextAvailable}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Rate:</span>
                <span className="text-purple-400 font-medium">{mentor.hourlyRate}</span>
              </div>
            </div>

            {/* Achievements */}
            <div className="mb-4">
              <h5 className="text-sm font-medium text-gray-400 mb-2">Achievements:</h5>
              <div className="flex flex-wrap gap-2">
                {mentor.achievements.map((achievement) => (
                  <span key={achievement} className="px-2 py-1 bg-yellow-600 bg-opacity-20 text-yellow-300 rounded text-xs flex items-center">
                    <Award className="h-3 w-3 mr-1" />
                    {achievement}
                  </span>
                ))}
              </div>
            </div>

            {/* Session Types */}
            <div className="mb-4">
              <h5 className="text-sm font-medium text-gray-400 mb-2">Session Types:</h5>
              <div className="flex flex-wrap gap-2">
                {mentor.sessionTypes.map((type) => (
                  <span key={type} className="px-2 py-1 bg-blue-600 bg-opacity-20 text-blue-300 rounded text-xs">
                    {type}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center text-sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Connect
                </button>
                <button className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule
                </button>
              </div>
              <div className="flex space-x-2">
                <button className="text-gray-400 hover:text-purple-400 transition-colors">
                  <Video className="h-5 w-5" />
                </button>
                <button className="text-gray-400 hover:text-green-400 transition-colors">
                  <Phone className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Quick Info */}
            <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between text-xs text-gray-500">
              <span>Joined {new Date(mentor.joinedDate).toLocaleDateString()}</span>
              <span>{mentor.location}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {filteredMentors.length > 0 && (
        <div className="text-center">
          <button className="bg-gray-800 text-gray-300 px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700">
            Load More Mentors
          </button>
        </div>
      )}

      {/* No Results */}
      {filteredMentors.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No mentors found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default MentorsList;