import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from './Header';
import { Calendar, Loader2 } from 'lucide-react';
import axios from 'axios';

interface User {
    _id: string;
    usn: string;
    fullname: string;
    year: number;
    email: string;
    avatar?: string;
    skills: string[];
    certifications: any[];
    projects: any[];       
    achievements: any[];   
    otherLinks: any[];    
    createdAt: string;
    updatedAt: string;
    bio?: string;
    github?: string;
    leetcode?: string;
    linkedin?: string;
    followersCount: number;
    followingCount: number;
    isfollower: boolean;
}

const UserProfileView: React.FC = () => {
  const { fullname } = useParams<{ fullname: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiBase = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!fullname) return;
    setLoading(true);
    setError(null);
    axios.get(`${apiBase}/api/v1/users/c/${encodeURIComponent(fullname)}`, { withCredentials: true })
      .then(res => {
        setUser(res.data?.data || null);
      })
      .catch(() => setError('User not found'))
      .finally(() => setLoading(false));
  }, [fullname, apiBase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin h-10 w-10 text-purple-400" />
        </div>
      </div>
    );
  }
  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-slate-800/70 rounded-2xl shadow-lg border border-slate-700/50 p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="flex flex-col items-center">
              <div className="w-36 h-36 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center mb-4 border-4 border-purple-900 overflow-hidden">
                {user.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('/')) ? (
                  <img src={user.avatar} alt={user.fullname} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl font-bold">{user.fullname?.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">{user.fullname}</h2>
              <p className="text-purple-400">{user.year} Year CSE</p>
              <p className="text-gray-400 text-sm">{user.usn}</p>
              <div className="flex items-center text-gray-400 text-sm mt-2">
                <Calendar className="h-4 w-4 mr-1" />
                Joined {new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}
              </div>
            </div>
            <div className="flex-1 w-full">
              <h3 className="text-xl font-semibold mb-2">Bio</h3>
              <p className="text-gray-300 mb-4">{user.bio || 'No bio provided.'}</p>
              <div className="mb-4">
                <h4 className="font-semibold text-lg mb-1">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {user.skills && user.skills.length > 0 ? user.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-purple-700/20 text-purple-300 rounded-full text-xs border border-purple-600/30">{skill}</span>
                  )) : <span className="text-gray-400">No skills listed.</span>}
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                {user.linkedin && <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">LinkedIn</a>}
                {user.github && <a href={user.github} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:underline">GitHub</a>}
                {user.leetcode && <a href={user.leetcode} target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline">LeetCode</a>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileView;
