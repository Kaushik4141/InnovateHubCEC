import React, { useEffect, useState } from "react";
import axios from "axios";
import {useNavigate } from "react-router-dom";
import Loader from "./loading";

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
      {posts.length === 0 && !loading && (
        <div className="text-center text-gray-400">No LinkedIn posts found.</div>
      )}
      {posts.map((post) => (
        <div key={post._id} className="bg-neutral-800 rounded-lg p-6 shadow">
          <div className="flex items-center mb-3">
            {post.owner?.avatar ? (
              <img
                src={post.owner.avatar}
                alt={post.owner.fullname}
                className="w-10 h-10 rounded-full mr-3"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center mr-3">
                {post.owner?.fullname
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() || "?"}
              </div>
            )}
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
          <div className="mb-2 text-white">{post.text}</div>
          {post.images && post.images.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {post.images.map((img, idx) => (
                <img key={idx} src={img.value} alt="LinkedIn post" className="max-h-48 rounded" />
              ))}
            </div>
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
    </div>
  );
};

export default LinkedinPostFeed;