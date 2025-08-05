import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from './Header';
import { Calendar, Loader2, Github, Linkedin } from 'lucide-react';
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
  linkedin?: string;
  leetcode?: string;
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
    <div className="min-h-screen bg-[#0f0f1c] text-white">
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="bg-[#181f2c] p-6 rounded-xl border border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full overflow-hidden">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.fullname}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-purple-700 flex items-center justify-center text-2xl font-bold">
                    {user.fullname.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{user.fullname}</h1>
                <p className="text-purple-400">{user.year}8th Year CSE</p>
                <p className="text-gray-400">Canara Engineering College</p>
                <div className="flex items-center text-sm text-gray-400 mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  Joined {new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <button className="bg-purple-600 text-white px-4 py-1 rounded hover:bg-purple-700 text-sm">Edit Profile</button>
              <button className="bg-gray-700 text-white px-4 py-1 rounded hover:bg-gray-600 text-sm">Share</button>
              <button className="bg-gray-700 text-white px-4 py-1 rounded hover:bg-gray-600 text-sm">
                <span className="sr-only">Settings</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 text-center mt-6 gap-4">
            <div><p className="text-purple-400 text-xl">0</p><p className="text-sm">Profile Views</p></div>
            <div><p className="text-blue-400 text-xl">{user.projects.length}</p><p className="text-sm">Projects</p></div>
            <div><p className="text-green-400 text-xl">{user.followersCount}</p><p className="text-sm">Followers</p></div>
            <div><p className="text-yellow-400 text-xl">{user.followingCount}</p><p className="text-sm">Following</p></div>
            <div><p className="text-red-400 text-xl">{user.achievements.length}</p><p className="text-sm">Achievements</p></div>
            <div><p className="text-indigo-400 text-xl">{user.certifications.length}</p><p className="text-sm">Certifications</p></div>
          </div>
        </div>
{/* Skills */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {user.skills.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-purple-600 bg-opacity-20 text-purple-300 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {/* Main Content Tabs */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl border border-gray-700 mb-6">
              <div className="flex border-b border-gray-700">
                {['about','projects','activity'].map(tab => (
                  <button key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-6 py-4 font-medium transition-colors ${activeTab===tab? 'text-purple-400 border-b-2 border-purple-400':'text-gray-400 hover:text-white'}`}
                  >{tab.charAt(0).toUpperCase()+tab.slice(1)}</button>
                ))}
              </div>
              <div className="p-6">
                {activeTab==='about' && <p className="text-gray-300">{user.bio}</p>}
                {activeTab==='projects' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-white">My Projects</h3>
                      <button className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center"onClick={() => navigate('/addpost')}>
                        <Plus className="h-4 w-4 mr-2" /> Add Project
                      </button>
                       <button className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center" onClick={Linkedinsyncpost}>
                        <Plus className="h-4 w-4 mr-2" /> Sync LinkedIn Posts
                    </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {user.projects.map(p => (
                        <div key={p.title} className="border border-gray-700 rounded-lg overflow-hidden">
                          {p.link && <a href={p.link} target="_blank"><img src={user.coverimage} alt={p.title} className="w-full h-48 object-cover" /></a>}
                          <div className="p-4">
                            <h4 className="font-semibold text-white mb-2">{p.title}</h4>
                            <p className="text-gray-400 text-sm mb-3">{p.description}</p>
                            <a href={p.link} className="text-purple-400 hover:underline">View Project</a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeTab==='activity' && <p className="text-gray-300">No recent activity.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default UserProfileView;
