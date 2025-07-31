import React, { useEffect, useState } from "react";
import axios from "axios";

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
  const apiBase = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchLinkedinPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${apiBase}/api/v1/posts/linkedinPosts`, {
          withCredentials: true,
        });
        setPosts(
            Array.isArray(res.data?.data?.linkedinPosts)
              ? res.data.data.linkedinPosts
              : []
          );
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load LinkedIn posts");
      } finally {
        setLoading(false);
      }
    };
    fetchLinkedinPosts();
  }, [apiBase]);

  if (loading) return <div className="text-center text-white py-8">Loading LinkedIn posts...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;

  return (
    <div className="space-y-8">
      {posts.length === 0 && (
        <div className="text-center text-gray-400">No LinkedIn posts found.</div>
      )}
      {posts.map((post) => (
        <div key={post._id} className="bg-neutral-800 rounded-lg p-6 shadow">
          <div className="flex items-center mb-2">
            {post.owner?.avatar && (
              <img src={post.owner.avatar} alt="avatar" className="w-8 h-8 rounded-full mr-2" />
            )}
            <span className="font-semibold text-white">{post.owner?.fullname || "Unknown User"}</span>
            <span className="ml-4 text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</span>
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
    </div>
  );
};

export default LinkedinPostFeed;
