import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    uid?: string | null;
  };

  const navigate = useNavigate();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<any>(null);
  const [connectStatus, setConnectStatus] = useState<Record<string, 'none' | 'requested' | 'loading'>>({});

  const avatarUrlFrom = (m: Mentor) => {
    const val = m.avatar || '';
    if (typeof val === 'string') {
      const isDefault = val.includes('default_avatar');
      if (val.startsWith('http') && !isDefault) return val;
      if (val.startsWith('/') && !isDefault) return `${(API_BASE || '').replace(/\/$/, '')}${val}`;
    }
    const seed = (m.id?.toString() || m.name || 'user');
    return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed)}&size=64`;
  };

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
          skills: Array.isArray(m.skills) && m.skills.length > 0 ? m.skills : (Array.isArray(m.expertise) ? m.expertise : []),
          rating: typeof m.rating === 'number' ? m.rating : 0,
          totalReviews: typeof m.totalReviews === 'number' ? m.totalReviews : 0,
          mentees: typeof m.mentees === 'number' ? m.mentees : 0,
          projects: typeof m.projects === 'number' ? m.projects : 0,
          sessionsCompleted: typeof m.sessionsCompleted === 'number' ? m.sessionsCompleted : 0,
          responseTime: m.responseTime || '',
          avatar: m.avatar || '',
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
        
          uid: m.userId || m._id || null,
        }));
        if (mounted) setMentors(normalized as Mentor[]);
      } catch (e) {
        if (mounted) setMentors([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadMentors();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadMe() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/users/current-user`, { credentials: 'include' });
        if (!mounted) return;
        if (res.ok) {
          const j = await res.json();
          setMe(j?.data || j || null);
        }
      } catch {
        setMe(null);
      }
    }
    loadMe();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">Mentors</h2>
          <p className="text-gray-400">Explore mentors</p>
        </div>
        <button
          onClick={() => navigate('/mentors/apply')}
          className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white border border-purple-500 shadow-sm"
        >
          Become a Mentor
        </button>
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
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-700">
                <img
                  src={avatarUrlFrom(mentor)}
                  alt={mentor.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).onerror = null; (e.currentTarget as HTMLImageElement).src = `${(API_BASE || '').replace(/\/$/, '')}/default_avatar.png`; }}
                />
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
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => navigate(`/profile/c/${encodeURIComponent(mentor.name)}`)}
                className="px-3 py-1.5 rounded bg-gray-700 text-white hover:bg-gray-600 border border-gray-600"
              >
                View Profile
              </button>
              <button
                onClick={() => mentor.uid ? navigate(`/messages?to=${mentor.uid}`) : navigate(`/profile/c/${encodeURIComponent(mentor.name)}`)}
                className="px-3 py-1.5 rounded bg-purple-600 text-white hover:bg-purple-700"
              >
                Message
              </button>
              {(!me || (mentor.uid && me?._id !== mentor.uid)) && (
                <button
                  onClick={async () => {
                    if (!mentor.uid) {
                      navigate(`/profile/c/${encodeURIComponent(mentor.name)}`);
                      return;
                    }
                    setConnectStatus((s) => ({ ...s, [mentor.uid as string]: 'loading' }));
                    try {
                      await fetch(`${API_BASE}/api/v1/users/${mentor.uid}/request-follow`, {
                        method: 'POST',
                        credentials: 'include',
                      });
                      setConnectStatus((s) => ({ ...s, [mentor.uid as string]: 'requested' }));
                    } catch {
                      setConnectStatus((s) => ({ ...s, [mentor.uid as string]: 'none' }));
                      alert('Could not send request.');
                    }
                  }}
                  disabled={mentor.uid ? (connectStatus[mentor.uid] === 'loading' || connectStatus[mentor.uid] === 'requested') : false}
                  className="px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                >
                  {mentor.uid && connectStatus[mentor.uid] === 'requested' ? 'Requested' : mentor.uid && connectStatus[mentor.uid] === 'loading' ? 'Sending...' : 'Connect'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MentorsList;