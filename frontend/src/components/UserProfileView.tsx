import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import { Calendar, Loader2, Github, Linkedin, Plus, Settings, Globe } from 'lucide-react';
import axios from 'axios';
import Loader from './loading';

interface Post {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  coverImage?: string;
}

interface Project {
  title: string;
  description: string;
  coverimage?: string;
  link: string;
  githubLink?: string;
  liveLink?: string;
}

interface User {
  _id: string;
  usn: string;
  fullname: string;
  year: number;
  email: string;
  avatar?: string;
  skills: string[];
  certifications: any[];
  projects: Project[];
  achievements: any[];
  posts: Post[];
  otherLinks: any[];
  createdAt: string;
  updatedAt: string;
  bio?: string;
  github?: string;
  linkedin?: string;
  followersCount: number;
  followingCount: number;
  isfollower: boolean;
}

const getOrdinalSuffix = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const UserProfileView: React.FC = () => {
  const { fullname } = useParams<{ fullname: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'about' | 'projects' | 'posts' | 'activity'>('about');
  const navigate = useNavigate();
  const apiBase = import.meta.env.VITE_API_URL;

  const loggedInUserId = localStorage.getItem('userId'); // or get from auth context

  useEffect(() => {
    if (!fullname) return;
    setLoading(true);
    axios
      .get(`${apiBase}/api/v1/users/c/${encodeURIComponent(fullname)}`, {
        withCredentials: true,
      })
      .then((res) => setUser(res.data?.data || null))
      .catch(() => setError('User not found'))
      .finally(() => setLoading(false));
  }, [fullname, apiBase]);

  useEffect(() => {
    if (user && user._id) {
      setProjectsLoading(true);
      axios.get(`${apiBase}/api/v1/posts/user/${user._id}`, { withCredentials: true })
        .then(res => {
          setProjects(res.data);
          setProjectsLoading(false);
        })
        .catch(err => {
          setProjectsError('Could not load projects.');
          setProjectsLoading(false);
        });
    }
  }, [user]);

  const handleFollowToggle = async () => {
    try {
      await axios.post(
        `${apiBase}/api/v1/users/${user?._id}/${user?.isfollower ? 'unfollow' : 'follow'}`,
        {},
        { withCredentials: true }
      );
      setUser((prev) => prev && { ...prev, isfollower: !prev.isfollower });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        <Header />

        <Loader />

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
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">

        {/* Profile Header */}
        <div className="bg-[#181f2c] p-6 rounded-xl border border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.fullname} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-purple-700 flex items-center justify-center text-2xl font-bold">
                    {user.fullname.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{user.fullname}</h1>
                <p className="text-purple-400">{getOrdinalSuffix(user.year)} Year CSE</p>
                <p className="text-gray-400">Canara Engineering College</p>
                <div className="flex items-center text-sm text-gray-400 mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  Joined {new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <button
                onClick={handleFollowToggle}
                className={`${user.isfollower ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                  } text-white px-4 py-1 rounded text-sm`}
              >
                {user.isfollower ? 'Unfollow' : 'Connect'}
              </button>
              <button className="bg-gray-700 text-white px-4 py-1 rounded hover:bg-gray-600 text-sm">Share</button>

              <button className="bg-gray-700 text-white p-2 rounded hover:bg-gray-600">
                <Settings className="h-4 w-4" />
              </button>

            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 text-center mt-6 gap-4">
            <div><p className="text-purple-400 text-xl">0</p><p className="text-sm">Profile Views</p></div>
            <div><p className="text-blue-400 text-xl">{user.projects.length}</p><p className="text-sm">Projects</p></div>
            <div><p className="text-green-400 text-xl">{user.followersCount}</p><p className="text-sm">Followers</p></div>
            <div><p className="text-yellow-400 text-xl">{user.followingCount}</p><p className="text-sm">Following</p></div>
            <div><p className="text-red-400 text-xl">{user.achievements.length}</p><p className="text-sm">Achievements</p></div>
            <div><p className="text-indigo-400 text-xl">{user.certifications.length}</p><p className="text-sm">Certifications</p></div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#181f2c] rounded-xl border border-gray-700">
          <div className="flex border-b border-gray-700">
            {['about', 'projects', 'posts', 'activity'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-4 font-medium transition-colors ${activeTab === tab ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'about' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">About</h3>
                <p className="text-gray-300">{user.bio || '—'}</p>
                <div className="flex items-center gap-4 text-sm text-gray-300">
                  <span>{user.email}</span>
                  {user.github && (
                    <a href={user.github} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white">
                      <Github className="w-4 h-4" /> GitHub
                    </a>
                  )}
                  {user.linkedin && (
                    <a href={user.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white">
                      <Linkedin className="w-4 h-4" /> LinkedIn
                    </a>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-white"> Projects</h3>
                </div>
                {projectsLoading ? (
                  <div>Loading projects...</div>
                ) : projectsError ? (
                  <div className="text-red-400">{projectsError}</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {projects.length === 0 ? (
                      <div className="col-span-2 text-gray-400">No projects found.</div>
                    ) : (
                      projects.map((p: any, idx: number) => (
                        <div key={idx} className="border border-gray-700 rounded-lg overflow-hidden">
                          {Array.isArray(p.postFile) && p.postFile.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {p.postFile.map((fileUrl: string, fileIdx: number) =>
                                fileUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                                  <video key={fileIdx} controls className="w-full h-48 object-cover">
                                    <source src={fileUrl} type="video/mp4" />
                                    Your browser does not support the video tag.
                                  </video>
                                ) : (
                                  <img key={fileIdx} src={fileUrl} alt={p.description} className="w-full h-48 object-cover" />
                                )
                              )}
                            </div>
                          )}
                          
                          <div className="p-4">
                            <h4 className="font-semibold text-white mb-2">{p.description || p.title}</h4>
                            {(p.liveLink || p.githubLink) && (
                  <div className="flex gap-2 mb-3">
                    {p.liveLink && (
                      <a
                        href={p.liveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-full transition-colors"
                      >
                        <Globe className="h-3 w-3 mr-1" />
                        Live Demo
                      </a>
                    )}
                    {p.githubLink && (
                      <a
                        href={p.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-full transition-colors"
                      >
                        <Github className="h-3 w-3 mr-1" />
                        GitHub
                      </a>
                    )}
                  </div>
                )}
                            <p className="text-gray-400 text-sm mb-3">Views: {p.views || 0}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'posts' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-white">Posts</h3>
                </div>

              </div>
            )}

            {activeTab === 'activity' && <p className="text-gray-300">No recent activity.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileView;
