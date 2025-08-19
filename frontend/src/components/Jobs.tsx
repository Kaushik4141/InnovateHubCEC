import { useState } from 'react';
import Header from './Header';
import { 
  Briefcase, MapPin, Clock, DollarSign, Users, Search, Filter,
  BookOpen, Star, ExternalLink, Bookmark, Calendar, Building,
  TrendingUp, Award, Plus
} from 'lucide-react';

const Jobs = () => {
  const [activeTab, setActiveTab] = useState('jobs');
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');

  const jobs = [
    {
      id: 1,
      title: "Frontend Developer Intern",
      company: "TechCorp Solutions",
      location: "Bangalore",
      type: "Internship",
      duration: "6 months",
      stipend: "₹25,000/month",
      postedAt: "2 days ago",
      applicants: 45,
      description: "Join our dynamic team to work on cutting-edge web applications using React and TypeScript.",
      requirements: ["React", "JavaScript", "CSS", "Git"],
      logo: "TC",
      featured: true,
      remote: false,
      experience: "0-1 years"
    },
    {
      id: 2,
      title: "Machine Learning Research Intern",
      company: "AI Innovations Lab",
      location: "Remote",
      type: "Internship",
      duration: "4 months",
      stipend: "₹30,000/month",
      postedAt: "1 day ago",
      applicants: 67,
      description: "Work on cutting-edge ML research projects in computer vision and natural language processing.",
      requirements: ["Python", "TensorFlow", "PyTorch", "Research"],
      logo: "AI",
      featured: true,
      remote: true,
      experience: "0-2 years"
    },
    {
      id: 3,
      title: "UI/UX Design Intern",
      company: "Creative Studio",
      location: "Mumbai",
      type: "Internship",
      duration: "3 months",
      stipend: "₹20,000/month",
      postedAt: "3 days ago",
      applicants: 32,
      description: "Design intuitive user interfaces and experiences for mobile and web applications.",
      requirements: ["Figma", "Adobe XD", "Prototyping", "User Research"],
      logo: "CS",
      featured: false,
      remote: false,
      experience: "0-1 years"
    },
    {
      id: 4,
      title: "Backend Developer",
      company: "StartupXYZ",
      location: "Hyderabad",
      type: "Full-time",
      duration: "Permanent",
      stipend: "₹8-12 LPA",
      postedAt: "1 week ago",
      applicants: 89,
      description: "Build scalable backend systems and APIs for our growing platform.",
      requirements: ["Node.js", "MongoDB", "AWS", "Docker"],
      logo: "SX",
      featured: false,
      remote: true,
      experience: "1-3 years"
    },
    {
      id: 5,
      title: "Data Science Intern",
      company: "Analytics Pro",
      location: "Pune",
      type: "Internship",
      duration: "6 months",
      stipend: "₹28,000/month",
      postedAt: "4 days ago",
      applicants: 56,
      description: "Analyze large datasets and build predictive models for business insights.",
      requirements: ["Python", "SQL", "Pandas", "Machine Learning"],
      logo: "AP",
      featured: true,
      remote: false,
      experience: "0-1 years"
    }
  ];

  const competitions = [
    {
      id: 1,
      title: "Global AI Challenge 2024",
      organizer: "IEEE",
      prize: "₹5,00,000",
      deadline: "15 days left",
      participants: 2500,
      category: "AI/ML",
      difficulty: "Advanced"
    },
    {
      id: 2,
      title: "Smart City Hackathon",
      organizer: "Government of India",
      prize: "₹2,00,000",
      deadline: "8 days left",
      participants: 1200,
      category: "IoT",
      difficulty: "Intermediate"
    }
  ];

  const courses = [
    {
      id: 1,
      title: "Advanced React Development",
      provider: "TechEd",
      duration: "8 weeks",
      price: "₹4,999",
      rating: 4.8,
      students: 1250,
      level: "Intermediate"
    },
    {
      id: 2,
      title: "Machine Learning Fundamentals",
      provider: "DataLearn",
      duration: "12 weeks",
      price: "₹7,999",
      rating: 4.9,
      students: 2100,
      level: "Beginner"
    }
  ];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.requirements.some(req => req.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLocation = locationFilter === 'all' || 
                           job.location.toLowerCase() === locationFilter.toLowerCase() ||
                           (locationFilter === 'remote' && job.remote);
    return matchesSearch && matchesLocation;
  });

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'Internship':
        return 'bg-blue-600 bg-opacity-20 text-blue-300';
      case 'Full-time':
        return 'bg-green-600 bg-opacity-20 text-green-300';
      case 'Part-time':
        return 'bg-yellow-600 bg-opacity-20 text-yellow-300';
      default:
        return 'bg-gray-600 bg-opacity-20 text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Career Hub</h1>
          <p className="text-gray-400">Discover internships, jobs, competitions, and learning opportunities</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center">
              <Briefcase className="h-8 w-8 text-blue-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">{jobs.length}</p>
                <p className="text-sm text-gray-400">Open Positions</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-yellow-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">{competitions.length}</p>
                <p className="text-sm text-gray-400">Active Competitions</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-green-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">{courses.length}</p>
                <p className="text-sm text-gray-400">Featured Courses</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-400 mr-3" />
              <div>
                <p className="text-2xl font-bold text-white">85%</p>
                <p className="text-sm text-gray-400">Placement Rate</p>
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
                  placeholder="Search jobs, companies, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500"
              >

                <option value="all">All Locations</option>
                <option value="bangalore">Bangalore</option>
                <option value="mumbai">Mumbai</option>
                <option value="hyderabad">Hyderabad</option>
                <option value="pune">Pune</option>
                <option value="remote">Remote</option>
              </select>
              <button className="flex items-center px-4 py-2 bg-gray-700 rounded-lg text-gray-300 hover:bg-gray-600 transition-colors">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 mb-8">
          <div className="flex border-b border-gray-700 overflow-x-auto whitespace-nowrap">
            <button 
              onClick={() => setActiveTab('jobs')}
              className={`px-6 py-4 font-medium transition-colors ${activeTab === 'jobs' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}
            >
              Jobs & Internships
            </button>
            <button 
              onClick={() => setActiveTab('competitions')}
              className={`px-6 py-4 font-medium transition-colors ${activeTab === 'competitions' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}
            >
              Competitions
            </button>
            <button 
              onClick={() => setActiveTab('courses')}
              className={`px-6 py-4 font-medium transition-colors ${activeTab === 'courses' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}
            >
              Learning
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'jobs' && (
              <div className="space-y-6">
                {/* Featured Jobs */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <Star className="h-5 w-5 mr-2 text-yellow-400" />
                    Featured Opportunities
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {jobs.filter(job => job.featured).slice(0, 2).map((job) => (
                      <div key={job.id} className="bg-gray-700 rounded-xl p-6 border border-yellow-500 border-opacity-30">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold mr-4">
                              {job.logo}
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">{job.title}</h4>
                              <p className="text-purple-400">{job.company}</p>
                            </div>
                          </div>
                          <span className="px-2 py-1 bg-yellow-600 bg-opacity-20 text-yellow-300 rounded text-xs font-medium">
                            Featured
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {job.location}
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {job.stipend}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* All Jobs */}
                <div className="space-y-6">
                  {filteredJobs.map((job) => (
                    <div key={job.id} className="bg-gray-700 rounded-xl p-6 border border-gray-600 hover:border-purple-500 transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg mr-4">
                            {job.logo}
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-1">{job.title}</h3>
                            <p className="text-purple-400 font-medium">{job.company}</p>
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-400">
                              <span className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {job.location}
                                {job.remote && <span className="ml-1 text-green-400">(Remote)</span>}
                              </span>
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {job.duration}
                              </span>
                              <span className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                {job.stipend}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getJobTypeColor(job.type)}`}>
                            {job.type}
                          </span>
                          {job.featured && (
                            <Star className="h-5 w-5 text-yellow-400 fill-current" />
                          )}
                        </div>
                      </div>

                      <p className="text-gray-300 mb-4 leading-relaxed">{job.description}</p>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Required Skills:</h4>
                        <div className="flex flex-wrap gap-2">
                          {job.requirements.map((req) => (
                            <span key={req} className="px-3 py-1 bg-purple-600 bg-opacity-20 text-purple-300 rounded-full text-sm">
                              {req}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {job.applicants} applicants
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Posted {job.postedAt}
                          </span>
                          <span className="flex items-center">
                            <Building className="h-4 w-4 mr-1" />
                            {job.experience}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 justify-end sm:justify-start">
                          <button className="text-gray-400 hover:text-yellow-400 transition-colors min-w-[44px]">
                            <Bookmark className="h-5 w-5" />
                          </button>
                          <button className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex-1 sm:flex-none min-w-[140px]">
                            Apply Now
                          </button>
                          <button className="bg-gray-600 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors min-w-[44px]">
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'competitions' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <h3 className="text-xl font-semibold text-white">Active Competitions</h3>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Submit Competition
                  </button>
                </div>

                {competitions.map((comp) => (
                  <div key={comp.id} className="bg-gray-700 rounded-xl p-6 border border-gray-600">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">{comp.title}</h3>
                        <p className="text-purple-400 font-medium">{comp.organizer}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold text-lg">{comp.prize}</p>
                        <p className="text-sm text-gray-400">{comp.deadline}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {comp.participants} participants
                        </span>
                        <span className="px-2 py-1 bg-blue-600 bg-opacity-20 text-blue-300 rounded">
                          {comp.category}
                        </span>
                        <span className="px-2 py-1 bg-yellow-600 bg-opacity-20 text-yellow-300 rounded">
                          {comp.difficulty}
                        </span>
                      </div>
                      <button className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                        Participate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'courses' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white">Recommended Courses</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {courses.map((course) => (
                    <div key={course.id} className="bg-gray-700 rounded-xl p-6 border border-gray-600">
                      <h3 className="text-lg font-semibold text-white mb-2">{course.title}</h3>
                      <p className="text-purple-400 mb-4">{course.provider}</p>
                      
                      <div className="space-y-2 mb-4 text-sm text-gray-400">
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Price:</span>
                          <span className="text-green-400">{course.price}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Level:</span>
                          <span>{course.level}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-300 ml-1">{course.rating}</span>
                        </div>
                        <span className="text-sm text-gray-400">{course.students} students</span>
                      </div>
                      
                      <button className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                        Enroll Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jobs;