import { useState, useEffect } from 'react';
import { 
  Trophy, Calendar, Award, Clock, Target, Search, Plus,
  ExternalLink, Zap, Code, Brain, Palette, Loader, Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { competitionApi, Competition as CompetitionType } from '../services/competitionApi';
import { getCurrentUser, type CurrentUser } from '../services/userApi';
import Header from './Header'; // Import the Header component

type Competition = CompetitionType & {
  organizer?: string;
  deadline?: string;
  participants?: number;
  maxParticipants?: number;
  prize?: string;
  difficulty?: string;
  category?: string;
  tags?: string[];
  status?: string;
  featured?: boolean;
  location?: string;
  teamSize?: string;
  requirements?: string[];
  icon?: any;
  image?: string;
  description?: string;
  id?: string;
};

const Competitions = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(4);
  const [expandedReqs, setExpandedReqs] = useState<Set<string>>(new Set());
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [me, setMe] = useState<CurrentUser | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    startDate: '', 
    endDate: '', 
    link: '', 
    teamsize: '1-4 members',
    Prize: '₹25,000',
    Tag: 'Web Development',
    Reqirements: 'Web development skills, Team registration',
    isTeamEvent: false
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        setLoading(true);
        const apiResponse = await competitionApi.listCompetitions();
        
        const competitionsArray = apiResponse?.data || [];
        const transformedData = competitionsArray.map((comp: CompetitionType) => ({
          ...comp,
          organizer: 'CampusConnect',
          deadline: comp.endDate, 
          participants: comp.applicationCount || 0,
          maxParticipants: 100, 
          prize: comp.Prize || '₹25,000',   
          difficulty: 'Intermediate', 
          category: comp.Tag || 'Web Development', 
          tags: comp.Tag ? comp.Tag.split(',').map(tag => tag.trim()) : ['Web', 'Development', 'Hackathon'], 
          status: new Date(comp.endDate) > new Date() ? 'Open' : 'Closed',
          featured: false,
          location: 'Online',
          teamSize: comp.teamsize || '1-4 members',
          requirements: comp.Reqirements ? comp.Reqirements.split(',').map(req => req.trim()) : ['Web development skills', 'Team registration'],
          image: comp.coverImage || 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=600',
          icon: Code,
          description: comp.description,
          id: comp._id,
        }));
        setCompetitions(transformedData);
      } catch (err) {
        console.error('Error fetching competitions:', err);
        setError('Failed to load competitions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitions();
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const u = await getCurrentUser();
        if (mounted) setMe(u);
      } catch (_) {
        if (mounted) setMe(null);
      }
    })();
    return () => { mounted = false; };
  }, []);

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
                         (competition.organizer && competition.organizer.toLowerCase().includes(searchTerm.toLowerCase()));
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

  const handleApplyToCompetition = async (competitionId: string) => {
    try {
      const competitionDetails = await competitionApi.getCompetitionDetails(competitionId);
      const competition = competitionDetails.data;
      
      if (competition.isTeamEvent) {
        navigate(`/competitions/${competitionId}/team`);
        return;
      }
      
      const apiResponse = await competitionApi.applyToCompetition(competitionId);

      const data = await competitionApi.listCompetitions();
      const competitionsArray = Array.isArray(data?.data) ? data.data : [];
      const transformedData = competitionsArray.map((comp: CompetitionType) => ({
        ...comp,
        organizer: 'CampusConnect',
        deadline: comp.endDate,
        participants: comp.applicationCount || 0,
        maxParticipants: 100,
        prize: '₹25,000',
        difficulty: 'Intermediate',
        category: 'Web Development',
        tags: ['Web', 'Development', 'Hackathon'],
        status: new Date(comp.endDate) > new Date() ? 'Open' : 'Closed',
        featured: false,
        location: 'Online',
        teamSize: '1-4 members',
        requirements: ['Web development skills', 'Team registration'],
        image: comp.coverImage || 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=600',
        icon: Code
      }));
      setCompetitions(transformedData);
      alert('Successfully applied to competition!');
    } catch (err) {
      console.error('Error applying to competition:', err);
      alert('Failed to apply to competition. Please try again.');
    }
  };

  const reloadCompetitions = async () => {
    try {
      const data = await competitionApi.listCompetitions();
      const competitionsArray = Array.isArray(data?.data) ? data.data : (data?.data || []);
      const transformedData = competitionsArray.map((comp: CompetitionType) => ({
        ...comp,
        organizer: 'CampusConnect',
        deadline: comp.endDate,
        participants: comp.applicationCount || 0,
        maxParticipants: 100,
        prize: comp.Prize || '₹25,000',
        difficulty: 'Intermediate',
        category: comp.Tag || 'Web Development',
        tags: comp.Tag ? comp.Tag.split(',').map(tag => tag.trim()) : ['Web', 'Development', 'Hackathon'],
        status: new Date(comp.endDate) > new Date() ? 'Open' : 'Closed',
        featured: false,
        location: 'Online',
        teamSize: comp.teamsize || '1-4 members',
        requirements: comp.Reqirements ? comp.Reqirements.split(',').map(req => req.trim()) : ['Web development skills', 'Team registration'],
        image: comp.coverImage || 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=600',
        icon: Code,
        description: comp.description,
        id: comp._id,
      }));
      setCompetitions(transformedData);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateCompetition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!me?.isAdmin) return;
    try {
      setCreating(true);
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('startDate', form.startDate);
      fd.append('endDate', form.endDate);
      fd.append('link', form.link);
      fd.append('teamsize', form.teamsize);
      fd.append('Prize', form.Prize);
      fd.append('Tag', form.Tag);
      fd.append('Reqirements', form.Reqirements);
      fd.append('isTeamEvent', form.isTeamEvent.toString());
      if (coverFile) fd.append('coverImage', coverFile);
      await competitionApi.createCompetition(fd);
      setShowCreate(false);
      setForm({ 
        title: '', 
        description: '', 
        startDate: '', 
        endDate: '', 
        link: '', 
        teamsize: '1-4 members',
        Prize: '₹25,000',
        Tag: 'Web Development',
        Reqirements: 'Web development skills, Team registration',
        isTeamEvent: false
      });
      setCoverFile(null);
      await reloadCompetitions();
    } catch (err) {
      console.error('Create competition failed', err);
      alert('Failed to create competition');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Competitions</h2>
              <p className="text-gray-400">Challenge yourself and showcase your skills</p>
            </div>
            {me?.isAdmin && (
              <button onClick={() => setShowCreate(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center text-sm sm:text-base">
                <Plus className="h-4 w-4 mr-2" />
                Create Competition
              </button>
            )}
          </div>

          {/* Search and Filters */}
          <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
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
              <div className="flex gap-2 overflow-x-auto flex-nowrap sm:flex-wrap pb-1">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setFilter(category.value)}
                    className={`shrink-0 px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm ${
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

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <Loader className="h-12 w-12 text-purple-500 mx-auto mb-4 animate-spin" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">Loading competitions...</h3>
            </div>
          )}

          {showCreate && me?.isAdmin && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black bg-opacity-60" onClick={() => setShowCreate(false)}></div>
              <div className="relative bg-gray-900 border border-gray-700 rounded-xl w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-700">
                  <h3 className="text-xl font-semibold text-white">Create Competition</h3>
                  <button className="text-gray-400 hover:text-white" onClick={() => setShowCreate(false)}>✕</button>
                </div>
                <form onSubmit={handleCreateCompetition} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Title</label>
                    <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Description</label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white h-28" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Start Date</label>
                      <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">End Date</label>
                      <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Registration Link</label>
                    <input type="url" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Team Size</label>
                    <input type="text" value={form.teamsize} onChange={(e) => setForm({ ...form, teamsize: e.target.value })} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Prize</label>
                    <input type="text" value={form.Prize} onChange={(e) => setForm({ ...form, Prize: e.target.value })} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Category/Tag</label>
                    <input type="text" value={form.Tag} onChange={(e) => setForm({ ...form, Tag: e.target.value })} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Requirements</label>
                    <textarea value={form.Reqirements} onChange={(e) => setForm({ ...form, Reqirements: e.target.value })} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white" />
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="isTeamEvent" 
                      checked={form.isTeamEvent} 
                      onChange={(e) => setForm({ ...form, isTeamEvent: e.target.checked })} 
                      className="h-4 w-4 text-purple-600 bg-gray-800 border-gray-700 rounded focus:ring-purple-500 focus:ring-offset-gray-800" 
                    />
                    <label htmlFor="isTeamEvent" className="ml-2 text-sm text-gray-400">This is a team event</label>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Cover Image</label>
                    <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} className="w-full text-gray-300" />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setShowCreate(false)} className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-600">Cancel</button>
                    <button disabled={creating} type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50">{creating ? 'Creating...' : 'Create'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-12 bg-red-900 bg-opacity-20 rounded-xl border border-red-700 p-6">
              <h3 className="text-xl font-semibold text-red-400 mb-2">Error</h3>
              <p className="text-gray-300">{error}</p>
            </div>
          )}

          {/* Featured Competitions */}
          {!loading && !error && filter === 'all' && (
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-400" />
                Featured Competitions
              </h3>
              <p className="text-gray-400 text-sm">Explore highlighted competitions happening now.</p>
            </div>
          )}

          {/* Competitions Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredCompetitions.slice(0, visibleCount).map((competition) => (
                <div key={competition.id ||competition._id} className="bg-gray-800 rounded-xl border border-gray-700 hover:border-purple-500 transition-all duration-300 overflow-hidden">
                  {/* Competition Image */}
                  <div className="relative h-40 sm:h-48 overflow-hidden">
                    <img 
                      src={competition.image} 
                      alt={competition.title}
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(competition.status || 'Unknown')}`}>
                        {competition.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(competition?.difficulty || 'Unknown')}`}>
                        {competition.difficulty}
                      </span>
                      {competition.isTeamEvent && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-600/70 text-white border border-blue-500">
                          <Users className="h-3 w-3 inline mr-1" /> Team
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 sm:p-6">
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-white mb-2">{competition.title}</h3>
                    
                    {/* Description */}
                    <p className="text-gray-300 mb-4 line-clamp-2 leading-relaxed text-sm">{competition.description}</p>

                    {/* Competition Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs sm:text-sm">
                      <div className="flex items-center text-gray-400">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{getDaysLeft(competition.deadline || 'Unknown')} days left</span>
                      </div>
                      <div className="flex items-center text-gray-400">
                        <Target className="h-4 w-4 mr-2" />
                        <span>{competition.teamSize || 'Unknown'}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {competition.tags?.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-gray-700 text-gray-300 rounded-md text-xs">
                          {tag}
                        </span>
                      ))}
                      {competition.tags ||'Unknown'?.length > 3 && (
                        <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded-md text-xs">
                          +{competition.tags || 'Unknown'.length - 3 || 'Unknown'} more
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs sm:text-sm text-gray-400 mb-1">
                        <span>Participants</span>
                        <span>{competition.participants}/{competition.maxParticipants}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                          style={{width: `${(competition?.participants || 0 /  0) * 100}%`}}
                        ></div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {competition.status === 'Open' ? (
                          <button 
                            onClick={() => handleApplyToCompetition(competition.id || 'Unknown')}
                            className="bg-purple-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center text-xs sm:text-sm"
                          >
                            <Trophy className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Participate
                          </button>
                        ) : competition.status === 'Closing Soon' ? (
                          <button 
                            onClick={() => handleApplyToCompetition(competition.id || 'Unknown')}
                            className="bg-yellow-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors flex items-center text-xs sm:text-sm"
                          >
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Register Now
                          </button>
                        ) : (
                          <button className="bg-gray-600 text-gray-300 px-3 py-2 rounded-lg font-medium cursor-not-allowed flex items-center text-xs sm:text-sm" disabled>
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Registration Closed
                          </button>
                        )}
                        <button onClick={() => setSelectedCompetition(competition)} className="bg-gray-700 text-gray-300 px-3 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center text-xs sm:text-sm">
                          <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Details
                        </button>
                      </div>
                    </div>

                    {/* Requirements */}
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <h4 className="text-xs sm:text-sm font-medium text-gray-400 mb-2">Requirements:</h4>
                      <ul className="text-xs text-gray-500 space-y-1">
                        {(expandedReqs.has(competition.id || '') ? competition.requirements || [] : (competition.requirements || []).slice(0, 2)).map((req, index) => (
                          <li key={index} className="flex items-center">
                            <div className="w-1 h-1 bg-purple-400 rounded-full mr-2"></div>
                            {req}
                          </li>
                        ))}
                        {competition.requirements || 'Unknown'.length > 2 && !expandedReqs.has(competition.id || '') && (
                          <li
                            className="text-purple-400 cursor-pointer hover:text-purple-300"
                            onClick={() => setExpandedReqs((prev) => {
                              const next = new Set(prev);
                              next.add(competition.id || 'Unknown');
                              return next;
                            })}
                          >
                            +{competition.requirements || 'Unknown'.length - 2 || 'Unknown'} more requirements
                          </li>
                        )}
                        {competition.requirements || 'Unknown'.length > 2 && expandedReqs.has(competition.id || '') && (
                          <li
                            className="text-purple-400 cursor-pointer hover:text-purple-300"
                            onClick={() => setExpandedReqs((prev) => {
                              const next = new Set(prev);
                              next.delete(competition.id || 'Unknown');
                              return next;
                            })}
                          >
                            Show less
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More */}
          {!loading && !error && filteredCompetitions.length > 0 && visibleCount < filteredCompetitions.length && (
            <div className="text-center">
              <button onClick={() => setVisibleCount((c) => Math.min(c + 4, filteredCompetitions.length))} className="bg-gray-800 text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700">
                Load More Competitions
              </button>
            </div>
          )}

          {/* No Results */}
          {!loading && !error && filteredCompetitions.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No competitions found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}

          {/* Details Modal */}
          {selectedCompetition && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black bg-opacity-60" onClick={() => setSelectedCompetition(null)}></div>
              <div className="relative bg-gray-900 border border-gray-700 rounded-xl w-11/12 max-w-3xl max-h-[85vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-700">
                  <h3 className="text-xl font-semibold text-white">{selectedCompetition.title}</h3>
                  <button className="text-gray-400 hover:text-white" onClick={() => setSelectedCompetition(null)}>✕</button>
                </div>
                <div className="p-6 space-y-4">
                  <img src={selectedCompetition.image} alt={selectedCompetition.title} className="w-full h-56 object-cover rounded-lg" />
                  <p className="text-gray-300">{selectedCompetition.description}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-400">
                    <div className="flex items-center"><Calendar className="h-4 w-4 mr-2" /> Start: {new Date(selectedCompetition.startDate).toLocaleDateString()}</div>
                    <div className="flex items-center"><Clock className="h-4 w-4 mr-2" /> End: {new Date(selectedCompetition.endDate).toLocaleDateString()}</div>
                    <div className="flex items-center"><Target className="h-4 w-4 mr-2" /> Team Size: {selectedCompetition.teamSize}</div>
                    <div className="flex items-center"><Award className="h-4 w-4 mr-2" /> Prize: {selectedCompetition.prize}</div>
                    {selectedCompetition.isTeamEvent && (
                      <div className="flex items-center"><Users className="h-4 w-4 mr-2" /> <span className="text-blue-400">Team Event</span></div>
                    )}
                  </div>
                  
                  {/* Team Event Link - Only show for team events */}
                  {selectedCompetition.isTeamEvent && (
                    <div className="mt-4">
                      <a 
                        href={`/competitions/${selectedCompetition._id}/team`}
                        className="inline-flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Manage Team
                      </a>
                      <p className="text-sm text-gray-400 mt-2">Create or join a team for this competition</p>
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {(selectedCompetition.tags || []).map((t) => (
                        <span key={t} className="px-2 py-1 bg-gray-700 text-gray-300 rounded-md text-xs">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Requirements</h4>
                    <ul className="text-xs text-gray-500 space-y-1">
                      {(selectedCompetition.requirements || []).map((req, idx) => (
                        <li key={idx} className="flex items-center"><div className="w-1 h-1 bg-purple-400 rounded-full mr-2"></div>{req}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-600" onClick={() => setSelectedCompetition(null)}>Close</button>
                    {selectedCompetition.status === 'Open' && (
                      <button 
                        onClick={() => {
                          handleApplyToCompetition(selectedCompetition.id || 'Unknown');  
                          setSelectedCompetition(null);
                        }}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                      >
                        Participate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Competitions;