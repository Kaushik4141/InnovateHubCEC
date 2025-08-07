import React, { useEffect, useState } from "react";
import axios from "axios";
import LinkedinPostFeed from "./LinkedinPostFeed"; // new component
import { useNavigate } from "react-router-dom";
import Loader from './loading'

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

  // Infinite scroll effect for project posts
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

  if (tab === 'project' && loading)
    return <Loader />;
  if (tab === 'project' && error)
    return <div className="text-center text-red-500 py-8">{error}</div>;

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold transition-colors ${tab === 'project' ? 'bg-purple-700 text-white' : 'bg-neutral-800 text-gray-400 hover:bg-purple-900'}`}
          onClick={() => setTab('project')}
        >
          Project
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold transition-colors ${tab === 'post' ? 'bg-purple-700 text-white' : 'bg-neutral-800 text-gray-400 hover:bg-purple-900'}`}
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
                  {post.owner?.avatar ? (
                    <img
                      src={post.owner.avatar}
                      alt={post.owner.fullname}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
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
                {/* Live Link and GitHub Link buttons */}
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
                  <div className="mt-3">
                    {Array.isArray(post.postFile) ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {post.postFile.map((fileUrl: string, idx: number) => (
                          <div key={idx}>
                            {/\.(jpg|jpeg|png|gif)$/i.test(fileUrl) ? (
                              <img
                                src={fileUrl}
                                alt={`Project file ${idx + 1}`}
                                className="w-full max-h-64 object-cover rounded-lg border border-gray-700"
                              />
                            ) : /\.(mp4|webm|ogg)$/i.test(fileUrl) ? (
                              <video
                                controls
                                src={fileUrl}
                                className="w-full max-h-64 rounded-lg border border-gray-700"
                              >
                                Your browser does not support the video tag.
                              </video>
                            ) : (
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-400 hover:underline text-sm block"
                              >
                                Download File {idx + 1}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Fallback for single file (backward compatibility)
                      <div>
                        {/\.(jpg|jpeg|png|gif)$/i.test(post.postFile) ? (
                          <img
                            src={post.postFile}
                            alt="Project file"
                            className="max-h-64 rounded-lg border border-gray-700"
                          />
                        ) : /\.(mp4|webm|ogg)$/i.test(post.postFile) ? (
                          <video
                            controls
                            src={post.postFile}
                            className="max-h-64 rounded-lg border border-gray-700"
                          >
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <a
                            href={post.postFile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:underline text-sm"
                          >
                            Download File
                          </a>
                        )}
                      </div>
                    )}
                  </div>
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

      {/* Infinite scroll sentinel */}
      {tab === 'project' && hasMore && !loading && (
        <div id="scroll-sentinel" style={{ height: 1, visibility: 'hidden' }} />
      )}
    </div>
  );
}

// Infinite scroll effect
// Must be inside the Feed component
// Already handled above

export default Feed;

