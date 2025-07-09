import React, { useState } from 'react';
import { 
  Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, 
  Code, Trophy, Award, Eye, ThumbsUp, Send, Image, Video, Calendar
} from 'lucide-react';

const Feed = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "Priya Sharma",
      year: "Final Year CSE",
      time: "2h ago",
      avatar: "PS",
      content: "Just completed my AI-powered study assistant project! 🚀 It uses NLP to create personalized learning paths. The system analyzes student performance and adapts content difficulty in real-time. Looking for feedback from the community and potential collaborators for the next phase.",
      image: "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=600",
      likes: 24,
      comments: 8,
      shares: 3,
      tags: ["AI/ML", "Python", "NLP", "Education"],
      type: "project",
      liked: false,
      bookmarked: false
    },
    {
      id: 2,
      author: "Raj Patel",
      year: "3rd Year ECE",
      time: "4h ago",
      avatar: "RP",
      content: "Excited to announce that our IoT Smart Campus project won first place in the TechFest competition! 🏆 Thanks to my amazing team and mentor Aditya Kumar. The project includes automated lighting, security systems, and energy monitoring across the campus.",
      likes: 45,
      comments: 12,
      shares: 7,
      tags: ["IoT", "Hardware", "Competition", "Arduino"],
      type: "achievement",
      liked: true,
      bookmarked: false
    },
    {
      id: 3,
      author: "Ananya Gupta",
      year: "4th Year IT",
      time: "6h ago",
      avatar: "AG",
      content: "Working on a collaborative code editor with real-time synchronization. The challenge is handling concurrent edits without conflicts. Any suggestions for conflict resolution algorithms? Currently exploring Operational Transformation vs CRDTs.",
      image: "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=600",
      likes: 18,
      comments: 15,
      shares: 2,
      tags: ["Web Dev", "React", "Node.js", "Collaboration"],
      type: "discussion",
      liked: false,
      bookmarked: true
    },
    {
      id: 4,
      author: "Karthik Reddy",
      year: "2nd Year Design",
      time: "1d ago",
      avatar: "KR",
      content: "Sharing my latest UI/UX case study on sustainable design principles. How can we create digital products that encourage eco-friendly behavior? This project explores gamification in environmental awareness apps.",
      image: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=600",
      likes: 29,
      comments: 6,
      shares: 4,
      tags: ["Design", "UX Research", "Sustainability", "Figma"],
      type: "project",
      liked: false,
      bookmarked: false
    }
  ]);

  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState('general');

  const handleLike = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleBookmark = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, bookmarked: !post.bookmarked }
        : post
    ));
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <Code className="h-4 w-4 text-blue-400" />;
      case 'achievement':
        return <Trophy className="h-4 w-4 text-yellow-400" />;
      case 'discussion':
        return <MessageCircle className="h-4 w-4 text-green-400" />;
      default:
        return null;
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'project':
        return 'border-l-blue-500';
      case 'achievement':
        return 'border-l-yellow-500';
      case 'discussion':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Post */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
            YU
          </div>
          <div className="flex-1">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share your latest project, achievement, or start a discussion..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <button 
              onClick={() => setPostType('project')}
              className={`flex items-center px-3 py-2 rounded-lg transition-colors ${postType === 'project' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-blue-400 hover:bg-gray-700'}`}
            >
              <Code className="h-4 w-4 mr-2" />
              Project
            </button>
            <button 
              onClick={() => setPostType('achievement')}
              className={`flex items-center px-3 py-2 rounded-lg transition-colors ${postType === 'achievement' ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:text-yellow-400 hover:bg-gray-700'}`}
            >
              <Trophy className="h-4 w-4 mr-2" />
              Achievement
            </button>
            <button 
              onClick={() => setPostType('discussion')}
              className={`flex items-center px-3 py-2 rounded-lg transition-colors ${postType === 'discussion' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-green-400 hover:bg-gray-700'}`}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Discussion
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="text-gray-400 hover:text-purple-400 transition-colors">
              <Image className="h-5 w-5" />
            </button>
            <button className="text-gray-400 hover:text-purple-400 transition-colors">
              <Video className="h-5 w-5" />
            </button>
            <button className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!newPost.trim()}
            >
              Post
            </button>
          </div>
        </div>
      </div>

      {/* Feed Posts */}
      {posts.map((post) => (
        <div key={post.id} className={`bg-gray-800 rounded-xl p-6 border-l-4 ${getPostTypeColor(post.type)} border-t border-r border-b border-gray-700`}>
          {/* Post Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                {post.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <h4 className="font-semibold text-white">{post.author}</h4>
                  {getPostTypeIcon(post.type) && (
                    <span className="ml-2">{getPostTypeIcon(post.type)}</span>
                  )}
                </div>
                <p className="text-sm text-gray-400">{post.year} • {post.time}</p>
              </div>
            </div>
            <button className="text-gray-400 hover:text-white transition-colors">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
          
          {/* Post Content */}
          <p className="text-gray-300 mb-4 leading-relaxed">{post.content}</p>
          
          {/* Post Image */}
          {post.image && (
            <div className="mb-4 rounded-lg overflow-hidden">
              <img src={post.image} alt="Post content" className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300" />
            </div>
          )}
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-purple-600 bg-opacity-20 text-purple-300 rounded-full text-sm hover:bg-purple-600 hover:bg-opacity-30 cursor-pointer transition-colors">
                #{tag}
              </span>
            ))}
          </div>
          
          {/* Engagement Stats */}
          <div className="flex items-center justify-between text-sm text-gray-400 mb-4 pb-4 border-b border-gray-700">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <ThumbsUp className="h-4 w-4 mr-1" />
                {post.likes} likes
              </span>
              <span>{post.comments} comments</span>
              <span>{post.shares} shares</span>
            </div>
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              <span>1.2k views</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => handleLike(post.id)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${post.liked ? 'text-red-400 bg-red-400 bg-opacity-10' : 'text-gray-400 hover:text-red-400 hover:bg-gray-700'}`}
              >
                <Heart className={`h-5 w-5 mr-2 ${post.liked ? 'fill-current' : ''}`} />
                Like
              </button>
              <button className="flex items-center px-4 py-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-gray-700 transition-colors">
                <MessageCircle className="h-5 w-5 mr-2" />
                Comment
              </button>
              <button className="flex items-center px-4 py-2 rounded-lg text-gray-400 hover:text-green-400 hover:bg-gray-700 transition-colors">
                <Share2 className="h-5 w-5 mr-2" />
                Share
              </button>
            </div>
            <button 
              onClick={() => handleBookmark(post.id)}
              className={`p-2 rounded-lg transition-colors ${post.bookmarked ? 'text-yellow-400 bg-yellow-400 bg-opacity-10' : 'text-gray-400 hover:text-yellow-400 hover:bg-gray-700'}`}
            >
              <Bookmark className={`h-5 w-5 ${post.bookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Comment Input */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                YU
              </div>
              <div className="flex-1 flex items-center">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button className="ml-2 text-purple-400 hover:text-purple-300 transition-colors">
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Load More */}
      <div className="text-center">
        <button className="bg-gray-800 text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700">
          Load More Posts
        </button>
      </div>
    </div>
  );
};

export default Feed;