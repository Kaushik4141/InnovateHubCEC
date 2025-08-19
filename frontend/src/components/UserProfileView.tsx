import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "./Header";
import {
  Calendar,
  Github,
  Linkedin,
  Settings,
  Globe,
} from "lucide-react";
import axios from "axios";
import Loader from "./loading";
import MediaLightbox, { LightboxMedia } from "./MediaLightbox";


const UserProfileView = () => {
  const apiBase = import.meta.env.VITE_API_URL;
  const { fullname } = useParams<{ fullname: string }>();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState<LightboxMedia | null>(null);
  const openLightbox = (m: LightboxMedia) => { setLightboxMedia(m); setLightboxOpen(true); };

  useEffect(() => {
    axios
      .get(`${apiBase}/api/v1/users/current-user`, { withCredentials: true })
      .then((res) => setCurrentUser(res.data.data));
  }, [apiBase]);
  const refreshViewedUser = () => setRefreshKey((k) => k + 1);



  // Component for handling expandable text with read more/less functionality
  const ExpandableText: React.FC<{ text: string; maxLength?: number }> = ({
    text,
    maxLength = 150,
  }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const shouldTruncate = text.length > maxLength;

    if (!shouldTruncate) {
      return (
        <p className="text-gray-300 mb-4 leading-relaxed whitespace-pre-wrap">
          {text}
        </p>
      );
    }

    const displayText = isExpanded ? text : text.slice(0, maxLength) + "...";

    return (
      <div className="mb-4 text-gray-300">
        <p className="leading-relaxed whitespace-pre-wrap">{displayText}</p>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-1 text-blue-400 hover:text-blue-300 text-sm font-medium focus:outline-none transition-colors"
          aria-label={isExpanded ? "Show less" : "Show more"}
        >
          {isExpanded ? "Read less" : "Read more"}
        </button>
      </div>
    );
  };

  // --- Connect Button & Notifications Logic ---


  const ConnectButton: React.FC<{
    viewedUser: any;
    currentUser: any;
    refreshUser: () => void;
  }> = ({ viewedUser, currentUser, refreshUser }) => {
    const [connectStatus, setConnectStatus] = useState<
      "none" | "requested" | "connected" | "loading"
    >("none");

    useEffect(() => {
      if (!viewedUser || !currentUser) return;
      if (viewedUser.isfollower || viewedUser.followers?.includes(currentUser._id)) {
        setConnectStatus("connected");
      } else if (viewedUser.followRequests?.includes(currentUser._id)) {
        setConnectStatus("requested");
      } else {
        setConnectStatus("none");
      }
    }, [viewedUser, currentUser]);

    const handleConnect = async () => {
      setConnectStatus("loading");
      try {
        await axios.post(
          `${apiBase}/api/v1/users/${viewedUser._id}/request-follow`,
          {},
          { withCredentials: true }
        );
        setConnectStatus("requested");
        refreshUser();
      } catch {
        setConnectStatus("none");
        alert("Could not send request.");
      }
    };

    return viewedUser._id !== currentUser._id ? (
      <button
        className={`px-4 py-2 rounded ${connectStatus === "connected" ? "bg-green-600" : "bg-blue-600"
          } text-white`}
        onClick={handleConnect}
        disabled={connectStatus !== "none"}
      >
        {connectStatus === "connected"
          ? "Connected"
          : connectStatus === "requested"
            ? "Requested"
            : "Connect"}
      </button>
    ) : null;
  };

  const Notifications: React.FC<{
    refreshUser: () => void;
  }> = ({ refreshUser }) => {
    const [notifications, setNotifications] = useState<any[]>([]);
    useEffect(() => {
      axios
        .get(`${apiBase}/api/v1/users/notifications`, { withCredentials: true })
        .then((res) => setNotifications(res.data.data.notifications));
    }, []);
    const handleAccept = async (fromUserId: string) => {
      await axios.post(
        `${apiBase}/api/v1/users/${fromUserId}/accept-follow`,
        {},
        { withCredentials: true }
      );
      setNotifications(notifications.filter((n) => n.from._id !== fromUserId));
      refreshUser();
    };
    const handleReject = async (fromUserId: string) => {
      await axios.post(
        `${apiBase}/api/v1/users/${fromUserId}/reject-follow`,
        {},
        { withCredentials: true }
      );
      setNotifications(notifications.filter((n) => n.from._id !== fromUserId));
      refreshUser();
    };
    return (
      <div>
        <h3>Notifications</h3>
        {notifications
          .filter((n) => n.type === "follow-request")
          .map((n) => (
            <div key={n._id} className="flex items-center gap-2">
              <img src={n.from.avatar} alt="" className="w-8 h-8 rounded-full" />
              <span>{n.from.fullname} wants to connect.</span>
              <button
                onClick={() => handleAccept(n.from._id)}
                className="bg-green-600 text-white px-2 py-1 rounded"
              >
                Accept
              </button>
              <button
                onClick={() => handleReject(n.from._id)}
                className="bg-red-600 text-white px-2 py-1 rounded"
              >
                Reject
              </button>
            </div>
          ))}
      </div>
    );
  };

  // LinkedIn-style image grid component
  const LinkedInImageGrid: React.FC<{ images: { value: string }[]; onOpen: (m: LightboxMedia) => void }> = ({
    images,
    onOpen,
  }) => {
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
      const baseClass =
        "w-full h-full object-cover cursor-pointer transition-transform hover:scale-105";

      switch (imageCount) {
        case 1:
          return `${baseClass} max-h-96 rounded-lg`;
        case 2:
          return `${baseClass} h-64 ${index === 0 ? "rounded-l-lg" : "rounded-r-lg"
            }`;
        case 3:
          if (index === 0) {
            return `${baseClass} h-64 row-span-2 rounded-l-lg`;
          }
          return `${baseClass} h-32 ${index === 1 ? "rounded-tr-lg" : "rounded-br-lg"
            }`;
        case 4:
          const corners = [
            "rounded-tl-lg",
            "rounded-tr-lg",
            "rounded-bl-lg",
            "rounded-br-lg",
          ];
          return `${baseClass} h-32 ${corners[index]}`;
        default:
          if (index < 3) {
            const corners = ["rounded-tl-lg", "rounded-tr-lg", "rounded-bl-lg"];
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
          {displayImages.map((img, index) => {
            const url = img.value;
            const isVideo = /\.(mp4|webm|ogg)$/i.test(url);
            return (
            <div key={index} className="relative overflow-hidden">
              {isVideo ? (
                <video
                  src={url}
                  className={getImageClass(index)}
                  onClick={() => onOpen({ type: 'video', url })}
                />
              ) : (
                <img
                  src={url}
                  alt={`Post image ${index + 1}`}
                  className={getImageClass(index)}
                  onClick={() => onOpen({ type: 'image', url })}
                />
              )}
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
          );})}
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
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

 
    // fullname from useParams is declared earlier
    const [user, setUser] = useState<User | null>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [projectsLoading, setProjectsLoading] = useState(false);
    const [projectsError, setProjectsError] = useState<string | null>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [postsLoading, setPostsLoading] = useState(false);
    const [postsError, setPostsError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<
      "about" | "projects" | "posts" | "activity"
    >("about");
    // apiBase is declared earlier

    useEffect(() => {
      if (!fullname) return;
      setLoading(true);
      axios
        .get(`${apiBase}/api/v1/users/c/${encodeURIComponent(fullname)}`, {
          withCredentials: true,
        })
        .then((res) => setUser(res.data?.data || null))
        .catch(() => setError("User not found"))
        .finally(() => setLoading(false));
    }, [fullname, apiBase, refreshKey]);
    useEffect(() => {
      if (user && user._id) {
        setPostsLoading(true);
        axios
          .get(`${apiBase}/api/v1/posts/linkedinPosts/${user._id}`, {
            withCredentials: true,
          })
          .then((res) => {
            console.log("LinkedIn Posts API Response:", res.data);
            const postsData =
              res.data?.data?.linkedinPosts || res.data?.linkedinPosts || [];
            setPosts(postsData);
            setPostsLoading(false);
          })
          .catch((err) => {
            console.error("LinkedIn Posts API Error:", err);
            setPostsError("Failed to load LinkedIn posts");
            setPostsLoading(false);
          });
      }
    }, [user, apiBase]);

    useEffect(() => {
      if (user && user._id) {
        setProjectsLoading(true);
        axios
          .get(`${apiBase}/api/v1/posts/user/${user._id}`, {
            withCredentials: true,
          })
          .then((res) => {
            setProjects(res.data);
            setProjectsLoading(false);
          })
          .catch(() => {
            setProjectsError("Could not load projects.");
            setProjectsLoading(false);
          });
      }
    }, [user]);

    // Removed legacy follow/unfollow toggle; now using Connect + notifications flow

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
        {currentUser && (
          <div className="mb-6">
            <Notifications refreshUser={refreshViewedUser} />
          </div>
        )}
        <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
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
                  <p className="text-purple-400">
                    {getOrdinalSuffix(user.year)} Year CSE
                  </p>
                  {/* Connect button (if not self) */}
                  {currentUser && user && (
                    <div className="mt-2 flex gap-2">
                      <ConnectButton
                        viewedUser={user}
                        currentUser={currentUser}
                        refreshUser={refreshViewedUser}
                      />
                      {currentUser._id !== user._id && (
                        <button
                          className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700"
                          onClick={() => navigate(`/messages?to=${user._id}`)}
                        >
                          Message
                        </button>
                      )}
                    </div>
                  )}
                  <p className="text-gray-400">Canara Engineering College</p>
                  <div className="flex items-center text-sm text-gray-400 mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined{" "}
                    {new Date(user.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                    })}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4 md:mt-0">
                <button className="bg-gray-700 text-white px-4 py-1 rounded hover:bg-gray-600 text-sm">
                  Share
                </button>

                <button className="bg-gray-700 text-white p-2 rounded hover:bg-gray-600">
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-6 text-center mt-6 gap-4">
              <div>
                <p className="text-purple-400 text-xl">0</p>
                <p className="text-sm">Profile Views</p>
              </div>
              <div>
                <p className="text-blue-400 text-xl">{user.projects.length}</p>
                <p className="text-sm">Projects</p>
              </div>
              <div>
                <p className="text-green-400 text-xl">{user.followersCount}</p>
                <p className="text-sm">Followers</p>
              </div>
              <div>
                <p className="text-yellow-400 text-xl">{user.followingCount}</p>
                <p className="text-sm">Following</p>
              </div>
              <div>
                <p className="text-red-400 text-xl">{user.achievements.length}</p>
                <p className="text-sm">Achievements</p>
              </div>
              <div>
                <p className="text-indigo-400 text-xl">
                  {user.certifications.length}
                </p>
                <p className="text-sm">Certifications</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-[#181f2c] rounded-xl border border-gray-700">
            <div className="flex border-b border-gray-700">
              {["about", "projects", "posts", "activity"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-6 py-4 font-medium transition-colors ${activeTab === tab
                      ? "text-purple-400 border-b-2 border-purple-400"
                      : "text-gray-400 hover:text-white"
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === "about" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">About</h3>
                  <p className="text-gray-300">{user.bio || "—"}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-300">
                    <span>{user.email}</span>
                    {user.github && (
                      <a
                        href={user.github}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 hover:text-white"
                      >
                        <Github className="w-4 h-4" /> GitHub
                      </a>
                    )}
                    {user.linkedin && (
                      <a
                        href={user.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 hover:text-white"
                      >
                        <Linkedin className="w-4 h-4" /> LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "projects" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-white">
                      {" "}
                      Projects
                    </h3>
                  </div>
                  {projectsLoading ? (
                    <div>Loading projects...</div>
                  ) : projectsError ? (
                    <div className="text-red-400">{projectsError}</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {projects.length === 0 ? (
                        <div className="col-span-2 text-gray-400">
                          No projects found.
                        </div>
                      ) : (
                        projects.map((p: any, idx: number) => (
                          <div
                            key={idx}
                            className="bg-gray-800 rounded-xl shadow-md border border-gray-700 overflow-hidden"
                          >
                            {/* LinkedIn-style image grid for project images */}
                            {Array.isArray(p.postFile) &&
                              p.postFile.length > 0 && (
                                <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {p.postFile.map(
                                    (fileUrl: string, fileIdx: number) =>
                                      fileUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                                        <video
                                          key={fileIdx}
                                          controls
                                          className="w-full max-h-64 rounded-lg border border-gray-700"
                                          onClick={() => openLightbox({ type: 'video', url: fileUrl })}
                                        >
                                          <source src={fileUrl} />
                                          Your browser does not support the video
                                          tag.
                                        </video>
                                      ) : (
                                        <img
                                          key={fileIdx}
                                          src={fileUrl}
                                          alt={p.title}
                                          className="w-full max-h-64 object-cover rounded-lg border border-gray-700"
                                          onClick={() => openLightbox({ type: 'image', url: fileUrl })}
                                        />
                                      )
                                  )}
                                </div>
                              )}
                            <div className="p-4">
                              <h4 className="font-semibold text-white mb-2">
                                {p.title}
                              </h4>
                              {p.description && (
                                <ExpandableText
                                  text={p.description}
                                  maxLength={180}
                                />
                              )}
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
                              <p className="text-gray-400 text-sm mb-3">
                                Views: {p.views || 0}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "posts" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-white">Posts</h3>
                  </div>
                  {postsLoading ? (
                    <div>Loading posts...</div>
                  ) : postsError ? (
                    <div className="text-red-400">{postsError}</div>
                  ) : (
                    <div className="space-y-6">
                      {posts.length === 0 ? (
                        <div className="text-center text-gray-400 py-8">
                          No LinkedIn posts found.
                        </div>
                      ) : (
                        posts.map((post: any) => (
                          <div
                            key={post._id}
                            className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-md"
                          >
                            {post.images && post.images.length > 0 && (
                              <LinkedInImageGrid images={post.images} onOpen={openLightbox} />
                            )}
                            <ExpandableText
                              text={post.text || ""}
                              maxLength={150}
                            />
                            <a
                              href={post.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:underline text-sm mt-2 inline-block"
                            >
                              View on LinkedIn
                            </a>
                            <p className="text-gray-500 text-xs mt-2">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "activity" && (
                <p className="text-gray-300">No recent activity.</p>
              )}
            </div>
          </div>
        </div>
        <MediaLightbox open={lightboxOpen} media={lightboxMedia} onClose={() => setLightboxOpen(false)} />
      </div>
    );
  }

export default UserProfileView;
