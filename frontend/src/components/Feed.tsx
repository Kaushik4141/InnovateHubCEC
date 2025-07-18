import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Post {
  _id: string;
  title: string;
  description: string;
  link?: string;
  tags?: string[];
  postFile?: string;
  owner?: {
    fullname: string;
    avatar?: string;
  };
  createdAt: string;
}

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('/api/v1/posts/getAllPost', { withCredentials: true });
        // Defensive: ensure posts is always an array
        let postsData = [];
        if (Array.isArray(res.data.data)) {
          postsData = res.data.data;
        } else if (res.data.data && Array.isArray(res.data.data.result)) {
          postsData = res.data.data.result;
        }
        setPosts(postsData);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load posts');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);
    if (loading) return <div className="text-center text-white py-8">Loading posts...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;

  return (
    <div className="space-y-8">
      {posts.length === 0 && <div className="text-center text-gray-400">No posts found.</div>}
      {posts.map(post => (
        <div key={post._id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-md">
          <div className="flex items-center mb-3">
            {post.owner?.avatar ? (
              <img src={post.owner.avatar} alt={post.owner.fullname} className="w-10 h-10 rounded-full mr-3" />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                {post.owner?.fullname?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
              </div>
            )}
            <div>
              <div className="font-semibold text-white">{post.owner?.fullname || 'Unknown'}</div>
              <div className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</div>
            </div>
          </div>
          <h3 className="text-xl font-bold text-purple-400 mb-2">{post.title}</h3>
          <p className="text-gray-200 mb-3">{post.description}</p>
          {post.link && (
            <a href={post.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm mb-2 inline-block">
              View on GitHub
            </a>
          )}
          {post.postFile && (
            <div className="mt-3">
              {post.postFile.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <img src={post.postFile} alt="Project file" className="max-h-64 rounded-lg border border-gray-700" />
              ) : (
                <a href={post.postFile} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline text-sm">Download File</a>
              )}
            </div>
          )}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-purple-600 bg-opacity-20 text-purple-300 rounded-full text-xs">{tag}</span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Feed;