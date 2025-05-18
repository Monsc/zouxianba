import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import ReportModal from './ReportModal';

interface Post {
  id: string;
  content: string;
  media?: string[];
  author: {
    id: string;
    username: string;
    handle: string;
    avatar: string;
  };
  createdAt: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

interface PostCardProps {
  post: Post;
  onLike: () => void;
}

function PostCard({ post, onLike }: PostCardProps) {
  const navigate = useNavigate();
  const [showReport, setShowReport] = useState(false);

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${post.author.id}`);
  };

  const handlePostClick = () => {
    navigate(`/post/${post.id}`);
  };

  return (
    <div className="post-card relative">
      {/* 举报按钮 */}
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors z-10"
        onClick={() => setShowReport(true)}
        aria-label="举报"
      >
        <i className="icon-bell" />
      </button>
      <ReportModal open={showReport} onClose={() => setShowReport(false)} targetPost={post.id} />
      <article
        className="post-card bg-white dark:bg-[#15202b] rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 mb-4 cursor-pointer border border-gray-100 dark:border-gray-800 p-4 group"
        onClick={handlePostClick}
      >
        <div className="post-header flex items-center mb-2">
          <img
            src={post.author.avatar || '/default-avatar.png'}
            alt={post.author.username}
            className="avatar w-12 h-12 rounded-full mr-3 border border-gray-200 dark:border-gray-700 object-cover shadow-sm hover:scale-105 transition-transform duration-200"
            onClick={handleAuthorClick}
          />
          <div className="post-meta flex-1">
            <div className="post-author flex items-center gap-2">
              <span className="username font-bold text-md hover:underline" onClick={handleAuthorClick}>
                {post.author.username}
              </span>
              <span className="handle text-gray-400 text-sm">@{post.author.handle}</span>
            </div>
            <span className="post-time text-xs text-gray-400">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>

        <div className="post-content mb-2 text-md text-gray-900 dark:text-gray-100">
          <p className="mb-2 whitespace-pre-line">{post.content}</p>
          {post.media && post.media.length > 0 && (
            <div className="post-media grid grid-cols-2 gap-2 mt-2">
              {post.media.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Media ${index + 1}`}
                  className="post-image rounded-lg object-cover w-full h-40 border border-gray-200 dark:border-gray-700 shadow-sm hover:scale-105 transition-transform duration-200"
                />
              ))}
            </div>
          )}
        </div>

        <div className="post-actions flex gap-6 mt-2">
          <button
            className={`action-button flex items-center gap-1 px-3 py-1 rounded-full transition-colors duration-150 hover:bg-pink-50 dark:hover:bg-pink-900/30 ${post.isLiked ? 'text-pink-600 dark:text-pink-400' : 'text-gray-500 dark:text-gray-400'}`}
            onClick={(e) => {
              e.stopPropagation();
              onLike();
            }}
          >
            <i className="icon-heart text-lg" />
            <span className="font-semibold">{post.likes}</span>
          </button>
          <button
            className="action-button flex items-center gap-1 px-3 py-1 rounded-full transition-colors duration-150 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-500 dark:text-gray-400"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/post/${post.id}`);
            }}
          >
            <i className="icon-comment text-lg" />
            <span className="font-semibold">{post.comments}</span>
          </button>
        </div>
      </article>
    </div>
  );
}

export default PostCard; 