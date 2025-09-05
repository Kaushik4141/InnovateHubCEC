import React, { useEffect, useRef, useState } from "react";
import axios from "../cookiescheker";
import { useInfiniteQuery } from "@tanstack/react-query";
import LinkedinPostFeed from "./LinkedinPostFeed"; 
import { useNavigate } from "react-router-dom";
import Loader from './loading'
import MediaLightbox, { LightboxMedia } from "./MediaLightbox";
import { toggleLike as apiToggleLike, getComments as apiGetComments, addComment as apiAddComment, incrementView as apiIncrementView, type CommentItem } from "../services/postApi";
import {ThumbsUp,MessageCircle,Eye } from 'lucide-react';

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

  const secureUrl = (url: string) => {
  if (!url) return url;
  return url.startsWith("http://res.cloudinary.com")
    ? url.replace("http://", "https://")
    : url;
};
  return (
    <div className="mt-3">
      {/* Images Grid */}
      {imageCount > 0 && (
        <div className="mb-4">
          <div className={`grid ${getGridLayout()} gap-1 max-w-full`}>
            {displayImages.map((fileUrl, index) => (
              <div key={index} className="relative overflow-hidden">
                <img
                  src={secureUrl(fileUrl)}
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
              src={secureUrl(fileUrl)}
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
  title?: string;
  description: string;
  link?: string;
  tags?: string[];
  postFile?: string | string[];
  owner?: {
    _id?: string;
    fullname: string;
    avatar?: string;
  };
  likesCount?: number;
  commentsCount?: number;
  isLiked?: boolean;
  views?: number;
  createdAt: string;
  liveLink?: string;
  githubLink?: string;
}

interface FeedPage {
  posts: Post[];
  total: number;
  page: number;
}

const Feed: React.FC = () => {
  const [tab, setTab] = useState<'project' | 'post'>('project');
  const apiBase = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const viewedSetRef = useRef<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Local state overrides for per-post counts and flags
  const [localPostState, setLocalPostState] = useState<Record<string, { likesCount: number; commentsCount: number; isLiked: boolean; views: number }>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentsMap, setCommentsMap] = useState<Record<string, { items: CommentItem[]; total: number; page: number; hasMore: boolean }>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
 

  const query = useInfiniteQuery({
    queryKey: ['feed', 'project'],
    enabled: tab === 'project',
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axios.get(`${apiBase}/api/v1/posts/getAllPost`, {
        params: { page: pageParam, limit: 10 },
        withCredentials: true,
      });
      const d = res.data;
      const postsData: Post[] = d?.data?.result ?? (Array.isArray(d?.data) ? d.data : []);
      const total: number = d?.data?.total ?? postsData.length;
      return { posts: postsData, total, page: pageParam };
    },
    getNextPageParam: (lastPage: FeedPage, pages: FeedPage[]) => {
      const loaded = pages.reduce((sum: number, p: FeedPage) => sum + p.posts.length, 0);
      return loaded < lastPage.total ? lastPage.page + 1 : undefined;
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    if (tab !== 'project') return;
    // Reset and refetch when switching to project
    query.refetch();
  }, [tab]);

  useEffect(() => {
    if (tab !== 'project') return;
    const handleScroll = () => {
      const sentinel = document.getElementById('scroll-sentinel');
      if (!sentinel) return;
      const rect = sentinel.getBoundingClientRect();
      if (rect.top < window.innerHeight + 100 && query.hasNextPage && !query.isFetchingNextPage) {
        query.fetchNextPage();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tab, query.hasNextPage, query.isFetchingNextPage]);

  const posts: Post[] = (query.data?.pages ?? []).flatMap((p: FeedPage) => p.posts);
  const loading = (query.status === 'pending' && tab === 'project') || query.isFetching && posts.length === 0;
  const hasMore = !!query.hasNextPage;
  const total = query.data?.pages?.[0]?.total ?? 0;
  const error = query.error as any;
  console.log({ pages: query.data?.pages?.length ?? 0, postsLength: posts.length, hasMore, total });
  const avatarUrlFrom = (name: string, avatar?: string) => {
    const isUsable = avatar && (avatar.startsWith('http') || avatar.startsWith('/'));
    const isDefault = avatar && avatar.includes('default_avatar');
    if (!isUsable || isDefault) {
      const seed = name || 'user';
      return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed)}&size=64`;
    }
    return avatar as string;
  };


  // Handlers
  const handleLike = async (post: Post) => {
    try {
      const id = post._id;
      const current = localPostState[id] ?? {
        likesCount: post.likesCount ?? 0,
        commentsCount: post.commentsCount ?? 0,
        isLiked: !!post.isLiked,
        views: post.views ?? 0,
      };
      // optimistic toggle
      setLocalPostState((s) => ({
        ...s,
        [id]: {
          ...current,
          likesCount: current.likesCount + (current.isLiked ? -1 : 1),
          isLiked: !current.isLiked,
        },
      }));
      const resp = await apiToggleLike(id);
      setLocalPostState((s) => ({
        ...s,
        [id]: {
          likesCount: resp.likesCount,
          commentsCount: resp.commentsCount,
          isLiked: resp.isLiked,
          views: resp.views,
        },
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const ensureCommentsLoaded = async (postId: string) => {
    const existing = commentsMap[postId];
    if (existing && existing.items.length > 0) return;
    const data = await apiGetComments(postId, 1, 10);
    setCommentsMap((m) => ({
      ...m,
      [postId]: { items: data.items, total: data.total, page: 1, hasMore: data.items.length < data.total },
    }));
  };

  const handleToggleComments = async (postId: string) => {
    setOpenComments((o) => ({ ...o, [postId]: !o[postId] }));
    if (!openComments[postId]) await ensureCommentsLoaded(postId);
  };

  const handleLoadMoreComments = async (postId: string) => {
    const entry = commentsMap[postId];
    const nextPage = (entry?.page ?? 1) + 1;
    const data = await apiGetComments(postId, nextPage, 10);
    setCommentsMap((m) => ({
      ...m,
      [postId]: {
        items: [...(m[postId]?.items ?? []), ...data.items],
        total: data.total,
        page: nextPage,
        hasMore: (m[postId]?.items?.length ?? 0) + data.items.length < data.total,
      },
    }));
  };

  const handleAddComment = async (post: Post) => {
    const text = (commentInputs[post._id] ?? '').trim();
    if (!text) return;
    try {
      const newItem = await apiAddComment(post._id, text);
      setCommentsMap((m) => ({
        ...m,
        [post._id]: {
          items: [newItem, ...(m[post._id]?.items ?? [])],
          total: (m[post._id]?.total ?? 0) + 1,
          page: m[post._id]?.page ?? 1,
          hasMore: ((m[post._id]?.items?.length ?? 0) + 1) < ((m[post._id]?.total ?? 0) + 1),
        },
      }));
      setCommentInputs((i) => ({ ...i, [post._id]: '' }));
      setLocalPostState((s) => {
        const current = s[post._id] ?? {
          likesCount: post.likesCount ?? 0,
          commentsCount: post.commentsCount ?? 0,
          isLiked: !!post.isLiked,
          views: post.views ?? 0,
        };
        return {
          ...s,
          [post._id]: { ...current, commentsCount: current.commentsCount + 1 },
        };
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Increment view when post enters viewport (once)
  useEffect(() => {
    if (tab !== 'project') return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(async (entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          const postId = target.getAttribute('data-post-id');
          if (!postId) return;
          if (viewedSetRef.current.has(postId)) return;
          viewedSetRef.current.add(postId);
          try {
            const data = await apiIncrementView(postId);
            setLocalPostState((s) => {
              const prev = s[postId];
              if (prev) return { ...s, [postId]: { ...prev, views: data.views } };
              // fallback from original post
              const post = posts.find(p => p._id === postId);
              return {
                ...s,
                [postId]: {
                  likesCount: post?.likesCount ?? 0,
                  commentsCount: post?.commentsCount ?? 0,
                  isLiked: !!post?.isLiked,
                  views: data.views,
                },
              };
            });
          } catch (e) {
            console.warn('Failed to increment view', e);
          }
        }
      });
    }, { threshold: 0.4 });

    // Observe each post card
    posts.forEach((p) => {
      const el = document.getElementById(`post-card-${p._id}`);
      if (el) observerRef.current?.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [tab, posts.map(p => p._id).join('|')]);

  // Early returns must come after all hooks to preserve hook call order
  if (tab === 'project' && loading) {
    return <Loader />;
  }
  if (tab === 'project' && error) {
    return <div className="text-center text-red-500 py-8">{error?.message || 'Failed to load posts'}</div>;
  }

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
      {tab === 'project' && (
        <div className="mb-8">
          
        </div>
      )}
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
                id={`post-card-${post._id}`}
                data-post-id={post._id}
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
                {
                  (() => {
                    const s = localPostState[post._id] ?? {
                      likesCount: post.likesCount ?? 0,
                      commentsCount: post.commentsCount ?? 0,
                      isLiked: !!post.isLiked,
                      views: post.views ?? 0,
                    };
                    return (
                      <div className="flex items-center text-gray-400 text-sm gap-6 mb-3 mt-2">
                        <button
                          className={`inline-flex items-center gap-1 hover:text-blue-300 transition-colors ${s.isLiked ? 'text-blue-400' : ''}`}
                          onClick={() => handleLike(post)}
                          aria-label={s.isLiked ? 'Unlike' : 'Like'}
                        >
                          <ThumbsUp/>
                          <span>{s.likesCount}</span>
                        </button>
                        <button
                          className="inline-flex items-center gap-1 hover:text-purple-300 transition-colors"
                          onClick={() => handleToggleComments(post._id)}
                          aria-label="Comments"
                        >
                          <MessageCircle/>
                          <span>{s.commentsCount}</span>
                        </button>
                        <div className="inline-flex items-center gap-1">
                          <Eye/>
                          <span>{s.views}</span>
                        </div>
                      </div>
                    );
                  })()
                }
                


                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {post.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-purple-600 bg-opacity-20 text-purple-300 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {openComments[post._id] && (
                  <div className="mt-4 border-t border-gray-700 pt-3">
                    <div className="flex gap-2 mb-3">
                      <input
                        value={commentInputs[post._id] ?? ''}
                        onChange={(e) => setCommentInputs((i) => ({ ...i, [post._id]: e.target.value }))}
                        placeholder="Add a comment..."
                        className="flex-1 bg-gray-900 text-gray-100 border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                      <button
                        onClick={() => handleAddComment(post)}
                        className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md"
                      >
                        Post
                      </button>
                    </div>
                    <div className="space-y-3">
                      {(commentsMap[post._id]?.items ?? []).map((c) => (
                        <div key={c.commentId} className="flex items-start gap-3">
                          <img
                            src={avatarUrlFrom(c.user?.fullname || 'user', c.user?.avatar)}
                            alt={c.user?.fullname || 'User'}
                            className="w-8 h-8 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="text-sm text-gray-300">
                              <span className="font-semibold">{c.user?.fullname || 'User'}</span>
                              <span className="ml-2 text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="text-gray-200 text-sm">{c.comment}</div>
                          </div>
                        </div>
                      ))}
                      {(commentsMap[post._id]?.hasMore) && (
                        <button
                          onClick={() => handleLoadMoreComments(post._id)}
                          className="text-sm text-blue-400 hover:text-blue-300"
                        >
                          Load more comments
                        </button>
                      )}
                      {((commentsMap[post._id]?.items ?? []).length === 0) && (
                        <div className="text-sm text-gray-500">No comments yet. Be the first to comment!</div>
                      )}
                    </div>
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
