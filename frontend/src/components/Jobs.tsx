import { useEffect, useState } from 'react';
import Header from './Header';
import {
  Briefcase, MapPin, Clock, DollarSign, Users, Search, Filter,
  BookOpen, Star, ExternalLink, Bookmark, Calendar, Building,
  TrendingUp, Award, Plus, X, ChevronDown, ChevronUp
} from 'lucide-react';
import { opportunityApi, Opportunity } from '../services/opportunityApi';

const Jobs = () => {
  const [activeTab, setActiveTab] = useState('jobs');
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'job' | 'internship'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const [jobs, setJobs] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const DESCRIPTION_PREVIEW = 280;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await opportunityApi.listOpportunities({
          type: typeFilter,
          q: searchTerm || undefined,
          page,
          limit: 20,
        });
        const data = (res as any)?.data || res;
        const items: Opportunity[] = data?.items || [];
        if (!mounted) return;
        setJobs(items);
        setTotal(data?.total ?? items.length ?? 0);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load opportunities');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [searchTerm, page, typeFilter]);

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

  const filteredJobs = jobs.filter((job) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (job.title || '').toLowerCase().includes(term) ||
      (job.company || '').toLowerCase().includes(term) ||
      (job.skills || []).some((req) => (req || '').toLowerCase().includes(term));
    const remoteStr = (job.remote || '').toLowerCase();
    const isRemote = remoteStr.includes('remote') || remoteStr.includes('yes') || remoteStr.includes('true');
    const matchesLocation =
      locationFilter === 'all' ||
      (job.location || '').toLowerCase() === locationFilter.toLowerCase() ||
      (locationFilter === 'remote' && (isRemote || (job.location || '').toLowerCase() === 'remote'));
    return matchesSearch && matchesLocation;
  });

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'Internship':
      case 'internship':
        return 'bg-blue-600 bg-opacity-20 text-blue-300';
      case 'Full-time':
      case 'Job':
      case 'job':
        return 'bg-green-600 bg-opacity-20 text-green-300';
      case 'Part-time':
        return 'bg-yellow-600 bg-opacity-20 text-yellow-300';
      default:
        return 'bg-gray-600 bg-opacity-20 text-gray-300';
    }
  };
  
  const getCompanyInitials = (name?: string) => {
    const n = (name || '').trim();
    if (!n) return '•';
    const parts = n.split(/\s+/).slice(0, 2);
    return parts.map(p => p[0]?.toUpperCase() || '').join('') || n[0]?.toUpperCase() || '•';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20 lg:pb-0">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Career Hub</h1>
          <p className="text-gray-400">Discover internships, jobs, competitions, and learning opportunities</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 md:p-6 border border-gray-700 shadow-lg">
            <div className="flex items-center">
              <Briefcase className="h-6 w-6 md:h-8 md:w-8 text-blue-400 mr-2 md:mr-3" />
              <div>
                <p className="text-xl md:text-2xl font-bold text-white">{total}</p>
                <p className="text-xs md:text-sm text-gray-400">Open Positions</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 md:p-6 border border-gray-700 shadow-lg">
            <div className="flex items-center">
              <Award className="h-6 w-6 md:h-8 md:w-8 text-yellow-400 mr-2 md:mr-3" />
              <div>
                <p className="text-xl md:text-2xl font-bold text-white">{competitions.length}</p>
                <p className="text-xs md:text-sm text-gray-400">Active Competitions</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 md:p-6 border border-gray-700 shadow-lg">
            <div className="flex items-center">
              <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-green-400 mr-2 md:mr-3" />
              <div>
                <p className="text-xl md:text-2xl font-bold text-white">{courses.length}</p>
                <p className="text-xs md:text-sm text-gray-400">Featured Courses</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 md:p-6 border border-gray-700 shadow-lg">
            <div className="flex items-center">
              <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-purple-400 mr-2 md:mr-3" />
              <div>
                <p className="text-xl md:text-2xl font-bold text-white">85%</p>
                <p className="text-xs md:text-sm text-gray-400">Placement Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 md:p-6 mb-8 border border-gray-700 shadow-lg">
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs, companies, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-3">
                <select
                  value={typeFilter}
                  onChange={(e) => { setTypeFilter(e.target.value as 'all' | 'job' | 'internship'); setPage(1); }}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Types</option>
                  <option value="job">Jobs</option>
                  <option value="internship">Internships</option>
                </select>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Locations</option>
                  <option value="bangalore">Bangalore</option>
                  <option value="mumbai">Mumbai</option>
                  <option value="hyderabad">Hyderabad</option>
                  <option value="pune">Pune</option>
                  <option value="remote">Remote</option>
                </select>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-4 py-2 bg-gray-700 rounded-lg text-gray-300 hover:bg-gray-600 transition-colors"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                  {showFilters ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
                </button>
              </div>
              
              {showFilters && (
                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600 animate-fadeIn">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-gray-300">Additional Filters</h3>
                    <button 
                      onClick={() => setShowFilters(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Experience Level</label>
                      <select className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white">
                        <option>Any</option>
                        <option>Entry Level</option>
                        <option>Mid Level</option>
                        <option>Senior Level</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Salary Range</label>
                      <select className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white">
                        <option>Any</option>
                        <option>0-3 LPA</option>
                        <option>3-6 LPA</option>
                        <option>6-10 LPA</option>
                        <option>10+ LPA</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 mb-8 shadow-lg">
          <div className="flex border-b border-gray-700 overflow-x-auto whitespace-nowrap">
            <button 
              onClick={() => setActiveTab('jobs')}
              className={`px-4 md:px-6 py-3 font-medium transition-colors ${activeTab === 'jobs' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}
            >
              Jobs & Internships
            </button>
            <button 
              onClick={() => setActiveTab('competitions')}
              className={`px-4 md:px-6 py-3 font-medium transition-colors ${activeTab === 'competitions' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}
            >
              Competitions
            </button>
            <button 
              onClick={() => setActiveTab('courses')}
              className={`px-4 md:px-6 py-3 font-medium transition-colors ${activeTab === 'courses' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}
            >
              Learning
            </button>
          </div>

          <div className="p-4 md:p-6">
            {activeTab === 'jobs' && (
              <div className="space-y-6">
                {error && (
                  <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}
                {loading && (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                )}
                
                {/* Featured Jobs */}
                {!loading && filteredJobs.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                      <Star className="h-5 w-5 mr-2 text-yellow-400" />
                      Featured Opportunities
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      {jobs.slice(0, 2).map((job) => (
                        <div key={(job as any)._id || (job as any).job_id} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 md:p-6 border border-yellow-500 border-opacity-30 shadow-lg">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold mr-3 md:mr-4">
                                {getCompanyInitials(job.company)}
                              </div>
                              <div>
                                <h4 className="font-semibold text-white text-sm md:text-base">{job.title}</h4>
                                <p className="text-purple-400 text-xs md:text-sm">{job.company}</p>
                              </div>
                            </div>
                            <span className="px-2 py-1 bg-yellow-600 bg-opacity-20 text-yellow-300 rounded text-xs font-medium">
                              Featured
                            </span>
                          </div>
                          <div className="flex flex-col md:flex-row md:items-center justify-between text-xs md:text-sm text-gray-400 gap-2">
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                              {job.location}
                            </span>
                            <span className="flex items-center">
                              <DollarSign className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                              {job.salary || '—'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Jobs */}
                <div className="space-y-4 md:space-y-6">
                  {filteredJobs.map((job) => (
                    <div key={(job as any)._id || (job as any).job_id} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 md:p-6 border border-gray-600 hover:border-purple-500 transition-all duration-300 shadow-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm md:text-lg mr-3 md:mr-4">
                            {getCompanyInitials(job.company)}
                          </div>
                          <div>
                            <h3 className="text-lg md:text-xl font-semibold text-white mb-1">{job.title}</h3>
                            <p className="text-purple-400 font-medium text-sm md:text-base">{job.company}</p>
                            <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2 text-xs md:text-sm text-gray-400">
                              <span className="flex items-center">
                                <MapPin className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                {job.location}
                                {(((job.remote || '').toLowerCase().includes('remote')) || ((job.remote || '').toLowerCase().includes('yes')) || ((job.remote || '').toLowerCase().includes('true')) || ((job.location || '').toLowerCase() === 'remote')) && <span className="ml-1 text-green-400">(Remote)</span>}
                              </span>
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                {job.employment_type || '—'}
                              </span>
                              <span className="flex items-center">
                                <DollarSign className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                {job.salary || '—'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium ${getJobTypeColor(job.type)}`}>
                            {job.type === 'internship' ? 'Internship' : 'Job'}
                          </span>
                        </div>
                      </div>

                      <div className="text-gray-300 mb-4 leading-relaxed text-sm md:text-base">
                        {(() => {
                          const id = (job as any)._id || (job as any).job_id;
                          const text = job.description || '';
                          const isExpanded = !!expanded[id];
                          const showToggle = text.length > DESCRIPTION_PREVIEW;
                          const display = isExpanded
                            ? text
                            : (showToggle ? text.slice(0, DESCRIPTION_PREVIEW) + '...' : text);
                          return (
                            <>
                              <span>{display}</span>
                              {showToggle && (
                                <button
                                  type="button"
                                  aria-expanded={isExpanded}
                                  onClick={() => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))}
                                  className="ml-2 text-purple-400 hover:text-purple-300 font-medium text-sm"
                                >
                                  {isExpanded ? 'Show less' : 'Read more'}
                                </button>
                              )}
                            </>
                          );
                        })()}
                      </div>

                      <div className="mb-4">
                        <h4 className="text-xs md:text-sm font-medium text-gray-400 mb-2">Required Skills:</h4>
                        <div className="flex flex-wrap gap-2">
                          {(job.skills || []).map((req) => (
                            <span key={req} className="px-2 py-1 md:px-3 md:py-1 bg-purple-600 bg-opacity-20 text-purple-300 rounded-full text-xs md:text-sm">
                              {req}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-400">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                            {job.posted_on ? `Posted ${job.posted_on}` : 'Posted —'}
                          </span>
                          <span className="flex items-center">
                            <Building className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                            {job.employment_type || '—'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-end">
                          <button className="text-gray-400 hover:text-yellow-400 transition-colors min-w-[44px] p-2">
                            <Bookmark className="h-4 w-4 md:h-5 md:w-5" />
                          </button>
                          <a href={job.apply_link} target="_blank" rel="noopener noreferrer" className="bg-purple-600 text-white px-4 py-2 md:px-6 md:py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex-1 text-center text-sm">
                            Apply Now
                          </a>
                          <a href={job.apply_link} target="_blank" rel="noopener noreferrer" className="bg-gray-600 text-gray-300 p-2 md:px-4 md:py-2 rounded-lg hover:bg-gray-500 transition-colors min-w-[44px] flex items-center justify-center">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!loading && !error && filteredJobs.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No opportunities found. Try adjusting your filters.</p>
                    </div>
                  )}
                  <div className="flex flex-col md:flex-row md:items-center justify-between pt-4 gap-4">
                    <span className="text-sm text-gray-400">Page {page} • Total {total}</span>
                    <div className="space-x-2">
                      <button
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="px-3 py-1.5 rounded bg-gray-700 border border-gray-600 text-gray-200 disabled:opacity-50 text-sm"
                      >
                        Prev
                      </button>
                      <button
                        disabled={jobs.length === 0 || (page * 20) >= total}
                        onClick={() => setPage((p) => p + 1)}
                        className="px-3 py-1.5 rounded bg-gray-700 border border-gray-600 text-gray-200 disabled:opacity-50 text-sm"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'competitions' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <h3 className="text-xl font-semibold text-white">Active Competitions</h3>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center text-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Submit Competition
                  </button>
                </div>

                {competitions.map((comp) => (
                  <div key={comp.id} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 md:p-6 border border-gray-600 shadow-lg">
                    <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg md:text-xl font-semibold text-white mb-2">{comp.title}</h3>
                        <p className="text-purple-400 font-medium text-sm md:text-base">{comp.organizer}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold text-base md:text-lg">{comp.prize}</p>
                        <p className="text-xs md:text-sm text-gray-400">{comp.deadline}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-400">
                        <span className="flex items-center">
                          <Users className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                          {comp.participants} participants
                        </span>
                        <span className="px-2 py-1 bg-blue-600 bg-opacity-20 text-blue-300 rounded text-xs">
                          {comp.category}
                        </span>
                        <span className="px-2 py-1 bg-yellow-600 bg-opacity-20 text-yellow-300 rounded text-xs">
                          {comp.difficulty}
                        </span>
                      </div>
                      <button className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm">
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {courses.map((course) => (
                    <div key={course.id} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 md:p-6 border border-gray-600 shadow-lg">
                      <h3 className="text-base md:text-lg font-semibold text-white mb-2">{course.title}</h3>
                      <p className="text-purple-400 mb-4 text-sm md:text-base">{course.provider}</p>
                      
                      <div className="space-y-2 mb-4 text-xs md:text-sm text-gray-400">
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
                          <Star className="h-3 w-3 md:h-4 md:w-4 text-yellow-400 fill-current" />
                          <span className="text-xs md:text-sm text-gray-300 ml-1">{course.rating}</span>
                        </div>
                        <span className="text-xs md:text-sm text-gray-400">{course.students} students</span>
                      </div>
                      
                      <button className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm">
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