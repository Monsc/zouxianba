import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './Button';
import { formatDistanceToNow } from 'date-fns';
import ReportModal from './ReportModal';

export const PostCard = ({ post, onLike, onComment, onDelete }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [showReport, setShowReport] = useState(false);

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    onComment(post._id, commentContent);
    setCommentContent('');
  };

  const handleAuthorClick = (e) => {
    e.stopPropagation();
    navigate(`/profile/${post.author._id}`);
  };

  const handlePostClick = () => {
    navigate(`/post/${post._id}`);
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
      <ReportModal open={showReport} onClose={() => setShowReport(false)} targetPost={post._id} />
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <Link to={`/profile/${post.author.username}`}>
            <img
              src={post.author.avatar || '/default-avatar.png'}
              alt={post.author.username}
              className="w-12 h-12 rounded-full"
            />
          </Link>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <Link
                  to={`/profile/${post.author.username}`}
                  className="font-bold text-gray-900 dark:text-white hover:underline"
                >
                  {post.author.username}
                </Link>
                <span className="text-gray-500 dark:text-gray-400 ml-2">
                  @{post.author.handle}
                </span>
              </div>
              <div className="text-gray-500 dark:text-gray-400 text-sm">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </div>
            </div>
            <p className="mt-2 text-gray-900 dark:text-white">{post.content}</p>
            {post.image && (
              <img
                src={post.image}
                alt="Post attachment"
                className="mt-4 rounded-lg max-h-96 w-full object-cover"
              />
            )}
            <div className="mt-4 flex items-center space-x-6">
              <button
                onClick={() => onLike(post._id)}
                className={`flex items-center space-x-2 ${
                  post.liked
                    ? 'text-red-500'
                    : 'text-gray-500 dark:text-gray-400 hover:text-red-500'
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill={post.liked ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span>{post.likes}</span>
              </button>
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-blue-500"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span>{post.commentCount}</span>
              </button>
              {user && user._id === post.author._id && (
                <button
                  onClick={() => onDelete(post._id)}
                  className="text-gray-500 dark:text-gray-400 hover:text-red-500"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
            {showComments && (
              <div className="mt-4 space-y-4">
                {post.comments.map(comment => (
                  <div key={comment._id} className="flex space-x-4">
                    <img
                      src={comment.author.avatar || '/default-avatar.png'}
                      alt={comment.author.username}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center">
                        <Link
                          to={`/profile/${comment.author.username}`}
                          className="font-bold text-gray-900 dark:text-white hover:underline"
                        >
                          {comment.author.username}
                        </Link>
                        <span className="text-gray-500 dark:text-gray-400 ml-2 text-sm">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="mt-1 text-gray-900 dark:text-white">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
                {user && (
                  <form onSubmit={handleSubmitComment} className="mt-4">
                    <div className="flex space-x-4">
                      <input
                        type="text"
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <Button type="submit" disabled={!commentContent.trim()}>
                        Comment
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
