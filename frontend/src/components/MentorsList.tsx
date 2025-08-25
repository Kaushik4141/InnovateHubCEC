import { useEffect, useState } from 'react';

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

  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Note: simplified UI does not include filters/search; show all mentors
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Mentors</h2>
        <p className="text-gray-400">Explore mentors</p>
      </div>
      {loading && (
        <div className="rounded-lg border border-gray-700 bg-gray-800 text-gray-300 px-4 py-3">
          Loading...
        </div>
      )}
      {!loading && mentors.length === 0 && (
        <div className="text-center py-12 text-gray-500">No mentors found</div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mentors.map((mentor) => (
          <div key={mentor.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {mentor.avatar}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{mentor.name}</h3>
                {mentor.specialization && (
                  <p className="text-xs text-gray-400">{mentor.specialization}</p>
                )}
              </div>
            </div>
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-400 mb-1">About</h4>
              <p className="text-gray-300 text-sm leading-relaxed">{mentor.bio || '—'}</p>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-400 mb-2">Core Skills</h5>
              <div className="flex flex-wrap gap-2">
                {mentor.skills && mentor.skills.length > 0 ? (
                  mentor.skills.slice(0, 8).map((skill) => (
                    <span key={skill} className="px-2 py-1 bg-purple-600 bg-opacity-20 text-purple-300 rounded text-xs">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-500">—</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MentorsList;