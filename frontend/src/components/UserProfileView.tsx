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
    axios
      .get(`${apiBase}/api/v1/users/c/${encodeURIComponent(fullname)}`, {
        withCredentials: true,
      })
      .then((res) => {
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
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Profile Top Card */}
        <div className="bg-slate-800/70 rounded-2xl border border-slate-700/50 p-6 md:p-8 flex flex-col md:flex-row md:items-start gap-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center md:items-start">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-purple-700 mb-2">
              {user.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('/')) ? (
                <img src={user.avatar} alt={user.fullname} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-purple-700 flex items-center justify-center text-4xl font-bold">
                  {user.fullname?.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <h2 className="text-3xl font-bold">{user.fullname}</h2>
            <p className="text-purple-400 text-sm">{user.year}th Year CSE</p>
            <p className="text-gray-400 text-sm">Canara Engineering College</p>
            <div className="flex items-center text-gray-400 text-sm mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              Joined {new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}
            </div>
          </div>

          {/* Stats and Buttons */}
          <div className="flex-1">
            <div className="flex justify-end mb-4 gap-2">
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded-md text-sm">Edit Profile</button>
              <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-1 rounded-md text-sm">Share</button>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-center text-sm">
              <div><p className="text-purple-400 text-xl">0</p><p>Profile Views</p></div>
              <div><p className="text-blue-400 text-xl">{user.projects?.length || 0}</p><p>Projects</p></div>
              <div><p className="text-green-400 text-xl">{user.followersCount || 0}</p><p>Followers</p></div>
              <div><p className="text-yellow-400 text-xl">{user.followingCount || 0}</p><p>Following</p></div>
              <div><p className="text-red-400 text-xl">{user.achievements?.length || 0}</p><p>Achievements</p></div>
              <div><p className="text-cyan-400 text-xl">{user.certifications?.length || 0}</p><p>Certifications</p></div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-8 bg-slate-800/60 p-6 rounded-xl border border-slate-700/40">
          <div className="border-b border-slate-700 mb-4 pb-2">
            <div className="flex gap-6 text-sm font-medium">
              <button className="text-purple-400 border-b-2 border-purple-500 pb-1">About</button>
              <button className="text-gray-400 hover:text-white">Projects</button>
              <button className="text-gray-400 hover:text-white">Activity</button>
            </div>
          </div>
          {/* About Tab */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Bio & Links */}
            <div>
              <h4 className="text-lg font-semibold mb-1">About</h4>
              <p className="text-gray-300 mb-2">{user.bio || "—"}</p>
              <p className="text-sm text-gray-400 mb-1">{user.email}</p>
              <div className="flex gap-4 mt-2 text-sm">
                {user.github && <a href={user.github} className="hover:underline text-gray-300" target="_blank">GitHub</a>}
                {user.linkedin && <a href={user.linkedin}
