import React, { useEffect, useState } from "react";
import axios from "axios";
import LinkedinPostFeed from "./LinkedinPostFeed"; 
import { useNavigate } from "react-router-dom";
import Loader from './loading'
import MediaLightbox, { LightboxMedia } from "./MediaLightbox";

const ProjectImageGrid: React.FC<{ files: string[] }> = ({ files }) => {
  const [showAll, setShowAll] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState<LightboxMedia | null>(null);
  const openLightbox = (media: LightboxMedia) => {
    setLightboxMedia(media);
    setLightboxOpen(true);
  };
  const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
  const videoFiles = files.filter(file => /\.(mp4|webm|ogg)$/i.test(file));
  const otherFiles = files.filter(file => !/\.(jpg|jpeg|png|gif|mp4|webm|ogg)$/i.test(file));
  
  const imageCount = imageFiles.length;
  
  if (imageCount === 0 && videoFiles.length === 0 && otherFiles.length === 0) return null;
  
  const getGridLayout = () => {
    switch (imageCount) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-1 sm:grid-cols-2";
      case 3:
        return "grid-cols-1 sm:grid-cols-2";
      case 4:
        return "grid-cols-1 sm:grid-cols-2";
      default:
        return "grid-cols-1 sm:grid-cols-2";
    }
  };
  
  const getImageClass = (index: number) => {
    const baseClass = "w-full h-full object-cover cursor-pointer transition-transform hover:scale-105 border border-gray-700";
    
    switch (imageCount) {
      case 1:
        return `${baseClass} max-h-96 rounded-lg`;
      case 2:
        return `${baseClass} h-64 rounded-lg ${index === 0 ? 'sm:rounded-l-lg' : 'sm:rounded-r-lg'}`;
      case 3:
        if (index === 0) {
          return `${baseClass} h-48 sm:h-64 sm:row-span-2 rounded-lg sm:rounded-l-lg`;
        }
        return `${baseClass} h-48 sm:h-32 rounded-lg ${index === 1 ? 'sm:rounded-tr-lg' : 'sm:rounded-br-lg'}`;
      case 4:
        const corners = ['sm:rounded-tl-lg', 'sm:rounded-tr-lg', 'sm:rounded-bl-lg', 'sm:rounded-br-lg'];
        return `${baseClass} h-32 rounded-lg ${corners[index]}`;
      default:
        if (index < 3) {
          const corners = ['sm:rounded-tl-lg', 'sm:rounded-tr-lg', 'sm:rounded-bl-lg'];
          return `${baseClass} h-48 sm:h-32 rounded-lg ${corners[index]}`;
        }
        return `${baseClass} h-48 sm:h-32 rounded-lg sm:rounded-br-lg relative`;
    }
  };
  
  const displayImages = showAll ? imageFiles : imageFiles.slice(0, 4);
  const remainingCount = imageCount - 4;
  
  return (
    <div className="mt-3">
      {/* Images Grid */}
      {imageCount > 0 && (
        <div className="mb-4">
          <div className={`grid ${getGridLayout()} gap-1 max-w-full`}>
            {displayImages.map((fileUrl, index) => (
              <div key={index} className="relative overflow-hidden">
                <img
                  src={fileUrl}
                  alt={`Project image ${index + 1}`}
                  className={getImageClass(index)}
                  onClick={() => openLightbox({ type: 'image', url: fileUrl })}
                />
                {/* Overlay for additional images */}
                {!showAll && index === 3 && remainingCount > 0 && (
                  <div 
                    className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center cursor-pointer rounded-lg sm:rounded-br-lg"
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
      )}
      
      {/* Videos */}
      {videoFiles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {videoFiles.map((fileUrl, idx) => (
            <video
              key={idx}
              controls
              src={fileUrl}
              className="w-full max-h-64 rounded-lg border border-gray-700 cursor-pointer"
              onClick={() => openLightbox({ type: 'video', url: fileUrl })}
            >
              Your browser does not support the video tag.
            </video>
          ))}
        </div>
      )}
      
      {/* Other Files */}
      {otherFiles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {otherFiles.map((fileUrl, idx) => (
            <a
              key={idx}
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
            >
              📎 Download File {idx + 1}
            </a>
          ))}
        </div>
      )}
      <MediaLightbox
        open={lightboxOpen}
        media={lightboxMedia}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
};

interface Post {
  _id: string;
  title: string;
  description: string;
  link?: string;
  tags?: string[];
  postFile?: string | string[];
  owner?: {
    fullname: string;
    avatar?: string;
  };
  createdAt: string;
  liveLink?: string;
  githubLink?: string;
}

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'project' | 'post'>('project');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const apiBase = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    if (tab === 'project') {
      setPosts([]);
      setPage(1);
      setHasMore(true);
    }
  }, [tab]);

  useEffect(() => {
    if (tab === 'project') {
      const fetchPosts = async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await axios.get(`${apiBase}/api/v1/posts/getAllPost?page=${page}&limit=10`, {
            withCredentials: true,
          });
          let postsData = [];
          if (res.data?.data?.result) {
            postsData = res.data.data.result;
          } else if (Array.isArray(res.data.data)) {
            postsData = res.data.data;
          }
          setTotal(res.data.data.total);
          setPosts(prev => {
            const newPosts = page === 1 ? postsData : [...prev, ...postsData];
            setHasMore(newPosts.length < res.data.data.total);
            return newPosts;
          });
        } catch (err: any) {
          setError(err.response?.data?.message || "Failed to load posts");
        } finally {
          setLoading(false);
        }
      };
      fetchPosts();
    }
  }, [tab, apiBase, page]);

  useEffect(() => {
    if (tab !== 'project' || !hasMore || loading) return;
    
    const handleScroll = () => {
      const sentinel = document.getElementById('scroll-sentinel');
      if (!sentinel) return;
      
      const rect = sentinel.getBoundingClientRect();
      if (rect.top < window.innerHeight + 100) {
        setPage(prev => prev + 1);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tab, hasMore, loading]);

  console.log({ page, postsLength: posts.length, hasMore, total });
  const avatarUrlFrom = (name: string, avatar?: string) => {
    const isUsable = avatar && (avatar.startsWith('http') || avatar.startsWith('/'));
    const isDefault = avatar && avatar.includes('default_avatar');
    if (!isUsable || isDefault) {
      const seed = name || 'user';
      return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed)}&size=64`;
    }
    return avatar as string;
  };

  if (tab === 'project' && loading)
    return <Loader />;
  if (tab === 'project' && error)
    return <div className="text-center text-red-500 py-8">{error}</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
        <button
          className={`w-full sm:w-auto px-4 py-2 rounded-t-lg font-semibold transition-colors ${tab === 'project' ? 'bg-purple-700 text-white' : 'bg-neutral-800 text-gray-400 hover:bg-purple-900'}`}
          onClick={() => setTab('project')}
        >
          Project
        </button>
        <button
          className={`w-full sm:w-auto px-4 py-2 rounded-t-lg font-semibold transition-colors ${tab === 'post' ? 'bg-purple-700 text-white' : 'bg-neutral-800 text-gray-400 hover:bg-purple-900'}`}
          onClick={() => setTab('post')}
        >
          Post
        </button>
      </div>
      <div className="space-y-8">
        {tab === 'project' ? (
          <>
            {posts.length === 0 && !loading && (
              <div className="text-center text-gray-400">No posts found.</div>
            )}
            {posts.map((post) => (
              <div
                key={post._id}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-md"
              >
                <div className="flex items-center mb-3">
                  <img
                    src={avatarUrlFrom(post.owner?.fullname || 'user', post.owner?.avatar)}
                    alt={post.owner?.fullname || 'Unknown'}
                    className="w-10 h-10 rounded-full mr-3"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = ((apiBase ? apiBase.replace(/\/$/, '') : '') + '/default_avatar.png'); }}
                  />
                  <div>
                    <button
                      className="text-white font-semibold hover:underline ml-2 focus:outline-none"
                      style={{ background: 'none', border: 'none', cursor: post.owner?.fullname!== 'Unknown' ? 'pointer' : 'default' }}
                      onClick={() => {
                        if (post.owner?.fullname !== 'Unknown') navigate(`/profile/c/${encodeURIComponent(post.owner?.fullname || '')}`);
                      }}
                      aria-label={`View profile of ${post.owner?.fullname}`}
                    >
                      {post.owner?.fullname || "Unknown"}
                    </button>
                    
                    <div className="text-xs text-gray-400">
                      {new Date(post.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-purple-400 mb-2">
                  {post.title}
                </h3>
                <p className="text-gray-200 mb-3">{post.description}</p>
                {(post.liveLink || post.githubLink) && (
                  <div className="flex gap-2 mb-3">
                    {post.liveLink && (
                      <a
                        href={post.liveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-full transition-colors"
                      >
                        🌐 Live Demo
                      </a>
                    )}
                    {post.githubLink && (
                      <a
                        href={post.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-full transition-colors"
                      >
                         GitHub
                      </a>
                    )}
                  </div>
                )}
                {post.link && (
                  <a
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline text-sm mb-2 inline-block"
                  >
                    View on GitHub
                  </a>
                )}
                {post.postFile && (
                  <ProjectImageGrid 
                    files={Array.isArray(post.postFile) ? post.postFile : [post.postFile]} 
                  />
                )}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-purple-600 bg-opacity-20 text-purple-300 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && <Loader />}
            {!loading && hasMore && (
              <div className="text-center py-4">
                <span className="text-gray-400">Scroll down to load more...</span>
              </div>
            )}
          </>
        ) : (
          <LinkedinPostFeed />
        )}
      </div>

     
      {tab === 'project' && hasMore && !loading && (
        <div id="scroll-sentinel" style={{ height: 1, visibility: 'hidden' }} />
      )}
    </div>
  );
}

export default Feed;
