import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from './Header';
import { Calendar, Loader2 } from 'lucide-react';
import axios from 'axios';

interface User {
  _id: string;
  fullname: string;
  usn: string;
  year: number;
  email: string;
  avatar?: string;
  bio?: string;
  skills: string[];
  certifications: any[];
  projects: any[];
  achievements: any[];
  otherLinks: any[];
  github?: string;
  linkedin?: string;
  leetcode?: string;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  isfollower: boolean;
}

const ProfileView: React.FC = () => {
  const { fullname } = useParams<{ fullname: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiBase = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!fullname) return;
    setLoading(true);
    axios.get(`${apiBase}/api/v1/users/c/${encodeURIComponent(fullname)}`, { withCredentials: true })
      .then(res => setUser(res.data?.data || null))
      .catch(() => setError('User not found.'))
      .finally(() => setLoading(false));
  }, [fullname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        <Header />
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="h-10 w-10 animate-spin text-purple-400" />
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        <Header />
        <div className="flex-1 flex justify-center items-center">
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
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 shadow-xl">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center border-4 border-purple-900">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.fullname} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold">{user.fullname.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <h1 className="text-2xl font-bold mt-3">{user.fullname}</h1>
              <p className="text-purple-400">{user.year} Year CSE</p>
              <p className="text-sm text-gray-400">{user.usn}</p>
              <div className="flex items-center text-gray-400 text-sm mt-2">
                <Calendar className="h-4 w-4 mr-1" />
                Joined {new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">Bio</h3>
              <p className="text-gray-300 mb-4">{user.bio || 'No bio provided.'}</p>

              <h3 className="text-xl font-semibold mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {user.skills.length > 0 ? (
                  user.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 text-sm bg-purple-600 bg-opacity-20 text-purple-300 rounded-full">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-400">No skills listed.</p>
                )}
              </div>

              <h3 className="text-xl font-semibold mb-2">Social Links</h3>
              <div className="flex gap-4">
                {user.linkedin && <a href={user.linkedin} target="_blank" className="text-blue-400 hover:underline">LinkedIn</a>}
                {user.github && <a href={user.github} target="_blank" className="text-gray-300 hover:underline">GitHub</a>}
                {user.leetcode && <a href={user.leetcode} target="_blank" className="text-yellow-400 hover:underline">LeetCode</a>}
                {user.otherLinks?.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" className="text-purple-300 hover:underline">{link.title}</a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
