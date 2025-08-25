import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { 
  MessageCircle, Star, Award, Code, Cpu, Palette, Brain, Database, Smartphone,
  Search, Users, Calendar, Video, Phone
} from 'lucide-react';

const API_BASE: string = ((import.meta as any).env?.VITE_API_URL as string | undefined) || '';

const MentorsList = () => {
  type Mentor = {
    id: string | number;
    name: string;
    year: string;
    specialization: string;
    bio: string;
    skills: string[];
    rating: number;
    totalReviews: number;
    mentees: number;
    projects: number;
    sessionsCompleted: number;
    responseTime: string;
    avatar: string;
    available: boolean;
    nextAvailable: string;
    hourlyRate: string;
    languages: string[];
    achievements: string[];
    experience: string;
    company: string;
    location: string;
    joinedDate: string;
    sessionTypes: string[];
    expertise: string[];
  };

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadMentors() {
      try {
        const url = `${API_BASE}/api/v1/mentors`;
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (!res.ok) throw new Error('Failed to load mentors');
        const json = await res.json();
      
        const data = Array.isArray(json) ? json : (json?.data ?? []);
        const normalized = (data as any[]).map((m) => ({
          id: m.id || m._id || m.name || Math.random().toString(36).slice(2),
          name: m.name || '',
          year: m.year || '',
          specialization: m.specialization || '',
          bio: m.bio || '',
          skills: Array.isArray(m.skills) ? m.skills : [],
          rating: typeof m.rating === 'number' ? m.rating : 0,
          totalReviews: typeof m.totalReviews === 'number' ? m.totalReviews : 0,
          mentees: typeof m.mentees === 'number' ? m.mentees : 0,
          projects: typeof m.projects === 'number' ? m.projects : 0,
          sessionsCompleted: typeof m.sessionsCompleted === 'number' ? m.sessionsCompleted : 0,
          responseTime: m.responseTime || '',
          avatar: m.avatar || (m.name ? m.name[0] : '?'),
          available: !!m.available,
          nextAvailable: m.nextAvailable || '',
          hourlyRate: m.hourlyRate || 'Free',
          languages: Array.isArray(m.languages) ? m.languages : [],
          achievements: Array.isArray(m.achievements) ? m.achievements : [],
          experience: m.experience || '',
          company: m.company || '',
          location: m.location || '',
          joinedDate: m.joinedDate || new Date().toISOString(),
          sessionTypes: Array.isArray(m.sessionTypes) ? m.sessionTypes : [],
          expertise: Array.isArray(m.expertise) ? m.expertise : [],
        }));
        if (mounted) setMentors(normalized as Mentor[]);
      } catch (e) {
        // Fallback: if fetch fails, keep mentors empty
        if (mounted) setMentors([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadMentors();
    return () => { mounted = false; };
  }, []);

  const iconFor = (spec: string) => {
    if (spec.includes('Full Stack')) return Code;
    if (spec.includes('Machine Learning')) return Brain;
    if (spec.includes('Embedded') || spec.includes('IoT')) return Cpu;
    if (spec.includes('UI/UX') || spec.includes('Design')) return Palette;
    if (spec.includes('Mobile')) return Smartphone;
    if (spec.includes('Database')) return Database;
    return Users;
  };

  const specializations = useMemo(() => [
    { name: "All", value: "all", count: mentors.length },
    { name: "Full Stack Development", value: "Full Stack Development", count: mentors.filter(m => m.specialization.includes("Full Stack")).length },
    { name: "Machine Learning & AI", value: "Machine Learning & AI", count: mentors.filter(m => m.specialization.includes("Machine Learning")).length },
    { name: "IoT & Embedded Systems", value: "IoT & Embedded Systems", count: mentors.filter(m => m.specialization.includes("IoT")).length },
    { name: "UI/UX Design", value: "UI/UX Design", count: mentors.filter(m => m.specialization.includes("UI/UX")).length },
    { name: "Mobile Development", value: "Mobile Development", count: mentors.filter(m => m.specialization.includes("Mobile")).length },
    { name: "Database Systems", value: "Database Systems", count: mentors.filter(m => m.specialization.includes("Database")).length }
  ], [mentors]);

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
        <button onClick={() => { setSubmitMessage(null); setShowMentorModal(true); }} className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors">
          Become a Mentor
        </button>
      </div>

      {/* Submission status banner */}
      {submitLoading && (
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-300 px-4 py-3">
          Submitting your application...
        </div>
      )}
      {submitMessage && !submitLoading && (
        <div className="rounded-lg border border-gray-700 bg-gray-800 text-gray-200 px-4 py-3">
          {submitMessage}
        </div>
      )}

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
            {mentors.filter(m => m.rating >= 4.8).slice(0, 3).map((mentor) => {
              const Icon = iconFor(mentor.specialization);
              return (
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
                    <Icon className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-400">{mentor.specialization}</p>
                </div>
              );
            })}
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
              {(() => { const Icon = iconFor(mentor.specialization); return <Icon className="h-6 w-6 text-gray-400 flex-shrink-0" />; })()}
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
      {filteredMentors.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No mentors found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Become a Mentor Modal */}
      {showMentorModal && (
        <BecomeMentorModal 
          onClose={() => setShowMentorModal(false)} 
          onSubmitStart={() => { setSubmitMessage(null); setSubmitLoading(true); }}
          onSubmitEnd={(message) => { setSubmitLoading(false); setSubmitMessage(message); }}
        />
      )}
    </div>
  );
};

type BecomeMentorForm = {
  fullName: string;
  email: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  specialization: string;
  whySuitable: string;
};

const BecomeMentorModal = ({ onClose, onSubmitStart, onSubmitEnd }: { onClose: () => void; onSubmitStart: () => void; onSubmitEnd: (message: string) => void; }) => {
  const [form, setForm] = useState<BecomeMentorForm>({
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    portfolio: '',
    specialization: '',
    whySuitable: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [userLoaded, setUserLoaded] = useState(false);

  // Auto-fill from current user profile
  useEffect(() => {
    let mounted = true;
    async function loadCurrentUser() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/users/current-user`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        });
        const json = await res.json().catch(() => ({}));
        const user = json?.data || {};
        if (mounted && user) {
          setForm(prev => ({
            ...prev,
            fullName: user.fullname || prev.fullName,
            email: user.email || prev.email,
            linkedin: user.linkedin || prev.linkedin,
            github: user.github || prev.github,
            // portfolio may not exist on profile; keep as-is if absent
            portfolio: user.portfolio || prev.portfolio,
          }));
          setUserLoaded(!!(user && (user.fullname || user.email)));
        }
      } catch (_) {
        // ignore; user may be unauthenticated
      }
    }
    loadCurrentUser();
    return () => { mounted = false; };
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    onSubmitStart();
    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        linkedin: form.linkedin,
        github: form.github,
        portfolio: form.portfolio,
        specialization: form.specialization,
        whySuitable: form.whySuitable,
        page: typeof window !== 'undefined' ? window.location.href : '',
        sent_at: new Date().toISOString()
      };
      const res = await fetch(`${API_BASE}/api/v1/mentors/apply`, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && (json?.success ?? res.status < 400)) {
        onSubmitEnd('Thanks! Your mentor application has been sent.');
        onClose();
      } else {
        const serverMsg = json?.message || '';
        onSubmitEnd(serverMsg ? `Submission error: ${serverMsg}` : 'Failed to send application. Please try again.');
      }
    } catch (err) {
      onSubmitEnd('An error occurred. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Become a Mentor</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input name="fullName" placeholder="Full Name" required value={form.fullName} onChange={handleChange} readOnly={userLoaded} className={`bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white ${userLoaded ? 'opacity-80 cursor-not-allowed' : ''}`} />
            <input type="email" name="email" placeholder="Email" required value={form.email} onChange={handleChange} readOnly={userLoaded} className={`bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white ${userLoaded ? 'opacity-80 cursor-not-allowed' : ''}`} />
            <input name="phone" placeholder="Phone (optional)" value={form.phone} onChange={handleChange} className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" />
            <input name="linkedin" placeholder="LinkedIn URL" value={form.linkedin} onChange={handleChange} readOnly={userLoaded} className={`bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white ${userLoaded ? 'opacity-80 cursor-not-allowed' : ''}`} />
            <input name="specialization" placeholder="Specialization (e.g., Full Stack)" required value={form.specialization} onChange={handleChange} className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" />
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Links (optional)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input name="github" placeholder="GitHub URL" value={form.github} onChange={handleChange} className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white" />
              <input name="portfolio" placeholder="Portfolio URL" value={form.portfolio} onChange={handleChange} className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white" />
            </div>
          </div>
          <textarea name="whySuitable" placeholder="Why are you suitable to be a mentor?" required value={form.whySuitable} onChange={handleChange} className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white w-full min-h-[120px]"></textarea>
          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800">Cancel</button>
            <button type="submit" disabled={submitting} className="px-5 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60">
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MentorsList;