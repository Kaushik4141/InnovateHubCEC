import React, { useEffect, useState } from "react";
import axios from "axios";
import {useNavigate } from "react-router-dom";
import Loader from "./loading";
import MediaLightbox, { LightboxMedia } from "./MediaLightbox";

// Component for handling expandable text with read more/less functionality
const ExpandableText: React.FC<{ text: string; maxLength?: number }> = ({ 
  text, 
  maxLength = 150 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = text.length > maxLength;
  
  if (!shouldTruncate) {
    return <div className="mb-2 text-white whitespace-pre-wrap">{text}</div>;
  }
  
  const displayText = isExpanded ? text : text.slice(0, maxLength) + '...';
  
  return (
    <div className="mb-2 text-white">
      <div className="whitespace-pre-wrap">{displayText}</div>
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
const LinkedInImageGrid: React.FC<{ images: { value: string }[]; onOpen: (m: LightboxMedia) => void }> = ({ images, onOpen }) => {
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

interface LinkedinPost {
  _id: string;
  owner: {
    _id: string;
    fullname?: string;
    avatar?: string;
  };
  url: string;
  text?: string;
  images?: { value: string }[];
  createdAt: string;
}

const LinkedinPostFeed: React.FC = () => {
  const [posts, setPosts] = useState<LinkedinPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const apiBase = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState<LightboxMedia | null>(null);
  const openLightbox = (m: LightboxMedia) => { setLightboxMedia(m); setLightboxOpen(true); };

  // Deterministic unique avatar when no uploaded avatar or default placeholder
  const avatarUrlFrom = (id?: string, name?: string, avatar?: string) => {
    const isUsable = avatar && (avatar.startsWith('http') || avatar.startsWith('/'));
    const isDefault = avatar && avatar.includes('default_avatar');
    if (!isUsable || isDefault) {
      const seed = id || name || 'user';
      return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed)}&size=64`;
    }
    return avatar as string;
  };

  useEffect(() => {
    const fetchLinkedinPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${apiBase}/api/v1/posts/linkedinPosts?page=${page}&limit=10`, {
          withCredentials: true,
        });
        const postsData = Array.isArray(res.data?.data?.linkedinPosts) ? res.data.data.linkedinPosts : [];
        setPosts(prev => page === 1 ? postsData : [...prev, ...postsData]);
        setHasMore(postsData.length === 10);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load LinkedIn posts");
      } finally {
        setLoading(false);
      }
    };
    fetchLinkedinPosts();
  }, [apiBase, page]);

  // Infinite scroll effect
  useEffect(() => {
    if (!hasMore || loading) return;
    const handleScroll = () => {
      const sentinel = document.getElementById('linkedin-scroll-sentinel');
      if (!sentinel) return;
      const rect = sentinel.getBoundingClientRect();
      if (rect.top < window.innerHeight + 100) {
        setPage(prev => prev + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading]);

  return (
    <div className="space-y-8">
      {error && (
        <div className="text-center text-red-400">{error}</div>
      )}
      {posts.length === 0 && !loading && (
        <div className="text-center text-gray-400">No LinkedIn posts found.</div>
      )}
      {posts.map((post) => (
        <div key={post._id} className="bg-neutral-800 rounded-lg p-6 shadow">
          <div className="flex items-center mb-3">
            <img
              src={avatarUrlFrom(post.owner?._id, post.owner?.fullname, post.owner?.avatar)}
              alt={post.owner?.fullname || 'Unknown'}
              className="w-10 h-10 rounded-full mr-3"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = ((apiBase ? apiBase.replace(/\/$/, '') : '') + '/default_avatar.png'); }}
            />
            <div>
              <button
                className="text-white font-semibold hover:underline ml-2 focus:outline-none"
                style={{ background: 'none', border: 'none', cursor: post.owner?.fullname !== 'Unknown' ? 'pointer' : 'default' }}
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
          {post.text && <ExpandableText text={post.text} maxLength={200} />}
          {post.images && post.images.length > 0 && (
            <LinkedInImageGrid images={post.images} onOpen={openLightbox} />
          )}
          <button
            className="mt-2 px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
            onClick={() => window.open(post.url, "_blank")}
          >
            View Post
          </button>
        </div>
      ))}
      {loading && <Loader />}
      {!loading && hasMore && (
        <div className="text-center py-4">
          <span className="text-gray-400">Scroll down to load more...</span>
        </div>
      )}
      {/* Infinite scroll sentinel */}
      {hasMore && !loading && (
        <div id="linkedin-scroll-sentinel" style={{ height: 1 }} />
      )}
      <MediaLightbox open={lightboxOpen} media={lightboxMedia} onClose={() => setLightboxOpen(false)} />
    </div>
  );
};

export default LinkedinPostFeed;