import React, { useState, useEffect, FC } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Header from './Header';
import {
  Edit, Calendar, Mail, Github, Linkedin, Globe,
  Plus, Settings, Share2, ExternalLink,
  Code,

} from 'lucide-react';
import EditProfileModal from './EditProfileModal';
import Loader from './loading';

// Component for handling expandable text with read more/less functionality
const ExpandableText: React.FC<{ text: string; maxLength?: number }> = ({ 
  text, 
  maxLength = 150 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = text.length > maxLength;
  
  if (!shouldTruncate) {
    return <p className="text-gray-300 mb-4 leading-relaxed whitespace-pre-wrap">{text}</p>;
  }
  
  const displayText = isExpanded ? text : text.slice(0, maxLength) + '...';
  
  return (
    <div className="mb-4 text-gray-300">
      <p className="leading-relaxed whitespace-pre-wrap">{displayText}</p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-1 text-blue-400 hover:text-blue-300 text-sm font-medium focus:outline-none transition-colors"
        aria-label={isExpanded ? 'Show less' : 'Show more'}
      >
        {isExpanded ? 'Read less' : 'Read more'}
      </button>
    </div>
  );
};

// LinkedIn-style image grid component
const LinkedInImageGrid: React.FC<{ images: { value: string }[] }> = ({ images }) => {
  const [showAll, setShowAll] = useState(false);
  const imageCount = images.length;
  
  if (imageCount === 0) return null;
  
  const getGridLayout = () => {
    switch (imageCount) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-2";
      case 3:
        return "grid-cols-2";
      case 4:
        return "grid-cols-2";
      default:
        return "grid-cols-2";
    }
  };
  
  const getImageClass = (index: number) => {
    const baseClass = "w-full h-full object-cover cursor-pointer transition-transform hover:scale-105";
    
    switch (imageCount) {
      case 1:
        return `${baseClass} max-h-96 rounded-lg`;
      case 2:
        return `${baseClass} h-64 ${index === 0 ? 'rounded-l-lg' : 'rounded-r-lg'}`;
      case 3:
        if (index === 0) {
          return `${baseClass} h-64 row-span-2 rounded-l-lg`;
        }
        return `${baseClass} h-32 ${index === 1 ? 'rounded-tr-lg' : 'rounded-br-lg'}`;
      case 4:
        const corners = ['rounded-tl-lg', 'rounded-tr-lg', 'rounded-bl-lg', 'rounded-br-lg'];
        return `${baseClass} h-32 ${corners[index]}`;
      default:
        if (index < 3) {
          const corners = ['rounded-tl-lg', 'rounded-tr-lg', 'rounded-bl-lg'];
          return `${baseClass} h-32 ${corners[index]}`;
        }
        return `${baseClass} h-32 rounded-br-lg relative`;
    }
  };
  
  const displayImages = showAll ? images : images.slice(0, 4);
  const remainingCount = imageCount - 4;
  
  return (
    <div className="mb-4">
      <div className={`grid ${getGridLayout()} gap-1 max-w-full`}>
        {displayImages.map((img, index) => (
          <div key={index} className="relative overflow-hidden">
            <img
              src={img.value}
              alt={`Post image ${index + 1}`}
              className={getImageClass(index)}
              onClick={() => window.open(img.value, '_blank')}
            />
            {/* Overlay for additional images */}
            {!showAll && index === 3 && remainingCount > 0 && (
              <div 
                className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center cursor-pointer rounded-br-lg"
                onClick={() => setShowAll(true)}
              >
                <span className="text-white text-xl font-semibold">
                  +{remainingCount}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      {showAll && imageCount > 4 && (
        <button
          onClick={() => setShowAll(false)}
          className="mt-2 text-blue-400 hover:text-blue-300 text-sm font-medium focus:outline-none transition-colors"
        >
          Show less
        </button>
      )}
    </div>
  );
};

// ----- Type Definitions -----
interface Certification {
  title: string;
  issuer?: string;
  date?: string;
}

interface ProjectItem {
  title: string;
  description?: string;
  link?: string;
  date?: string;
}

interface Achievement {
  title: string;
  description?: string;
  date?: string;
}

interface OtherLink {
  title: string;
  url: string;
}

interface User {
  _id: string;
  fullname: string;
  usn: string;
  year: number;
  email: string;
  avatar?: string;
  coverimage?: string;
  linkedin?: string;
  github?: string;
  leetcode?: string;
  bio?: string;
  skills: string[];
  certifications: Certification[];
  projects: ProjectItem[];
  achievements: Achievement[];
  otherLinks: OtherLink[];
  followers: Array<{ _id: string; fullname: string; avatar?: string }>;
  following: Array<{ _id: string; fullname: string; avatar?: string }>;
  createdAt: string;
  stats?: {
    profileViews?: number;
    posts?: number;
    connections?: number;
    mentees?: number;
    competitions?: number;
  };
}

// ----- Sub‑Components -----
const Stat: FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="text-center">
    <p className={`text-2xl font-bold text-${color}-400`}>{value}</p>
    <p className="text-sm text-gray-400">{label}</p>
  </div>
);

const ContactLine: FC<{ Icon: FC<any>; text?: string }> = ({ Icon, text }) => (
  <div className="flex items-center text-gray-400">
    <Icon className="h-4 w-4 mr-3" />
    <span className="text-sm">{text || '—'}</span>
  </div>
);

const SocialLink: FC<{ href: string; Icon: FC<any> }> = ({ href, Icon }) => (
  <a href={href} target="_blank" rel="noopener" className="text-gray-400 hover:text-white transition-colors">
    <Icon className="h-5 w-5" />
  </a>
);

// ----- Main Component -----
const Profile: FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'about' | 'projects' | 'posts' | 'activity'>('about');
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string|null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState<string|null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  const apiBase = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const url = userId ? `${apiBase}/api/v1/users/u/${userId}` : `${apiBase}/api/v1/users/current-user`;
    axios.get(url, { withCredentials: true })
      .then(res => {
        setUser(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Could not load profile.');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (user && user._id) {
      setProjectsLoading(true);
      console.log('Fetching projects for user:', user._id);
      axios.get(`${apiBase}/api/v1/posts/user/${user._id}`, { withCredentials: true })
        .then(res => {
          console.log('Projects API Response:', res.data);
          console.log('Projects data type:', typeof res.data, 'Is array:', Array.isArray(res.data));
         
          const projectsData = Array.isArray(res.data) ? res.data : (res.data.data || []);
          setProjects(projectsData);
          setProjectsLoading(false);
        })
        .catch(err => {
          console.error('Projects API Error:', err);
          setProjectsError('Failed to load projects');
          setProjectsLoading(false);
        });
    }
  }, [user, apiBase]);

  useEffect(() => {
    if (user && user._id) {
      setPostsLoading(true);
      axios.get(`${apiBase}/api/v1/posts/linkedinPosts/${user._id}`, { withCredentials: true })
        .then(res => {
          console.log('LinkedIn Posts API Response:', res.data);
          const postsData = res.data?.data?.linkedinPosts || res.data?.linkedinPosts || [];
          setPosts(postsData);
          setPostsLoading(false);
        })
        .catch(err => {
          console.error('LinkedIn Posts API Error:', err);
          setPostsError('Failed to load LinkedIn posts');
          setPostsLoading(false);
        });
    }
  }, [user, apiBase]);

  const handleAvatarClick = () => {
    if (avatarInputRef.current) {
      avatarInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('avatar', file);
    setAvatarUploading(true);
    setError(null);
    try {
      const res = await axios.patch(`${apiBase}/api/v1/users/avatar`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUser(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update avatar');
    } finally {
      setAvatarUploading(false);
    }
  };

  const Linkedinsyncpost = async () => {
    if (!user) {
      setError('User not loaded.');
      return;
    }
    try {
      const res = await axios.post(`${apiBase}/api/v1/posts/linkedinpost`, { Linkedin: user.linkedin }, { withCredentials: true });
      alert(res.data.message);
    } catch (err: any) {
      alert('post had synced');
    }
  };

  if (loading) return <Loader />;
  if (error)   return <p className="text-center text-red-500">{error}</p>;
  if (!user)  return <p className="text-center text-white">No user found.</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Profile Header */}
        <div className="bg-gray-800 rounded-xl p-8 mb-6 border border-gray-700">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
            <div className="flex items-center mb-6 lg:mb-0">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mr-6 overflow-hidden relative cursor-pointer group" onClick={handleAvatarClick}>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.fullname} className="w-full h-full object-cover" />
                ) : (
                  user.fullname.split(' ').map(n => n[0]).join('').toUpperCase()
                )}
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs">Change Avatar</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={avatarInputRef}
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                  disabled={avatarUploading}
                />
                {avatarUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60">
                    <span className="text-xs">Uploading...</span>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{user.fullname}</h1>
                <p className="text-lg text-purple-400 mb-1">{`${user.year}th Year CSE`}</p>
                <p className="text-gray-400 mb-2">Canara Engineering College</p>
                <div className="flex items-center text-gray-400 text-sm space-x-4">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined {new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center"
                onClick={() => setShowEditModal(true)}
              >
                <Edit className="h-4 w-4 mr-2" /> Edit Profile
              </button>
              <button className="bg-gray-700 text-gray-300 px-6 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center">
                <Share2 className="h-4 w-4 mr-2" /> Share
              </button>
              <button className="bg-gray-700 text-gray-300 p-2 rounded-lg hover:bg-gray-600 transition-colors">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-8 pt-6 border-t border-gray-700">
            <Stat label="Profile Views" value={user.stats?.profileViews || 0} color="purple" />
            <Stat label="Projects" value={user.projects.length} color="blue" />
            <Stat label="Followers" value={user.followers.length} color="green" />
            <Stat label="Following" value={user.following.length} color="yellow" />
            <Stat label="Achievements" value={user.achievements.length} color="red" />
            <Stat label="Certifications" value={user.certifications.length} color="indigo" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* About */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">About</h3>
              <>
                <ExpandableText text={user.bio || ''} maxLength={200} />
                <ContactLine Icon={Mail} text={user.email} />
                <div className="flex space-x-3 mt-4">
                  {user.github && <SocialLink href={user.github} Icon={Github} />}
                  {user.linkedin && <SocialLink href={user.linkedin} Icon={Linkedin} />}
                  {user.leetcode && <SocialLink href={user.leetcode} Icon={Code} />}
                  {user.otherLinks.map(l => <SocialLink key={l.url} href={l.url} Icon={ExternalLink} />)}
                </div>
              </>
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
                {['about','projects','posts','activity'].map(tab => (
                  <button key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-6 py-4 font-medium transition-colors ${activeTab===tab? 'text-purple-400 border-b-2 border-purple-400':'text-gray-400 hover:text-white'}`}
                  >{tab.charAt(0).toUpperCase()+tab.slice(1)}</button>
                ))}
              </div>
              <div className="p-6">
                {activeTab==='about' && 
                  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4">About</h3>
                    <ExpandableText text={user.bio || ''} maxLength={200} />
                  </div>
                }
                {activeTab==='projects' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold text-white">My Projects</h3>
                      <button className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center" onClick={() => navigate('/addpost')}>
                        <Plus className="h-4 w-4 mr-2" /> Add Project
                      </button>
                    </div>
                    {projectsLoading ? (
                      <div>Loading projects...</div>
                    ) : projectsError ? (
                      <div className="text-red-400">{projectsError}</div>
                    ) : (
                      <div className="space-y-6">
                        {projects.length === 0 ? (
                          <div className="text-center text-gray-400 py-8">No projects found.</div>
                        ) : (
                          projects.map((p: any) => (
                            <div key={p._id} className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-md">
                              <h4 className="font-semibold text-white mb-2">{p.title}</h4>
                              {p.postFile && (
                                <LinkedInImageGrid images={Array.isArray(p.postFile) ? p.postFile.map((f: string) => ({ value: f })) : [{ value: p.postFile }]} />
                              )}
                              <ExpandableText text={p.description || ''} maxLength={150} />
                              <p className="text-gray-400 text-sm my-3">Views: {p.views || 0}</p>
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
                              <p className="text-gray-500 text-xs">{new Date(p.createdAt).toLocaleDateString()}</p>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
                {activeTab==='posts' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold text-white">My Posts</h3>
                      <button className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center" onClick={Linkedinsyncpost}>
                        <Plus className="h-4 w-4 mr-2" /> Sync LinkedIn Posts
                      </button>
                    </div>
                    {postsLoading ? (
                      <div>Loading posts...</div>
                    ) : postsError ? (
                      <div className="text-red-400">{postsError}</div>
                    ) : (
                      <div className="space-y-6">
                        {posts.length === 0 ? (
                          <div className="text-center text-gray-400 py-8">No LinkedIn posts found.</div>
                        ) : (
                          posts.map((post: any) => (
                          <div key={post._id} className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-md">
                            {post.images && post.images.length > 0 && (
                              <LinkedInImageGrid images={post.images} />
                            )}
                            <ExpandableText text={post.text || ''} maxLength={150} />
                            <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm mt-2 inline-block">
                              View on LinkedIn
                            </a>
                            <p className="text-gray-500 text-xs mt-2">{new Date(post.createdAt).toLocaleDateString()}</p>
                          </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
                {activeTab==='activity' && <div className="text-center text-gray-400 py-8">Activity feed coming soon.</div>}
              </div>
            </div>
            {showEditModal && (
              <EditProfileModal
                open={showEditModal}
                onClose={() => setShowEditModal(false)}
                user={user}
                onSave={(updatedUser) => {
                  const updatedYear = { ...updatedUser, year: Number(updatedUser.year) };
                  setUser(prevUser => prevUser ? { ...prevUser, ...updatedYear } : null);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;