import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';

function Comment({ comment, onLike, onReply }) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(comment.isLiked);
  const [showActions, setShowActions] = useState(false);

  // 处理话题标签和提及
  const processContent = (content) => {
    const hashtagRegex = /#(\w+)/g;
    const mentionRegex = /@(\w+)/g;
    
    return content
      .split(/(\s+)/)
      .map((part, index) => {
        if (part.match(hashtagRegex)) {
          return (
            <Link
              key={index}
              to={`/hashtag/${part.slice(1)}`}
              className="text-twitter-blue hover:underline"
            >
              {part}
            </Link>
          );
        }
        if (part.match(mentionRegex)) {
          return (
            <Link
              key={index}
              to={`/profile/${part.slice(1)}`}
              className="text-twitter-blue hover:underline"
            >
              {part}
            </Link>
          );
        }
        return part;
      });
  };

  const handleLike = async () => {
    try {
      await onLike(comment._id);
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Like failed:', error);
    }
  };

  return (
    <article className="border-b border-twitter-gray-200 dark:border-twitter-gray-800 p-4 hover:bg-twitter-gray-50 dark:hover:bg-twitter-gray-900/50 transition-colors">
      <div className="flex space-x-3">
        {/* 用户头像 */}
        <Link to={`/profile/${comment.author._id}`} className="flex-shrink-0">
          <img
            src={comment.author.avatar || 'https://via.placeholder.com/40'}
            alt={comment.author.username}
            className="w-10 h-10 rounded-full"
          />
        </Link>

        {/* 内容区 */}
        <div className="flex-1 min-w-0">
          {/* 用户信息和时间 */}
          <div className="flex items-center space-x-2 mb-1">
            <Link to={`/profile/${comment.author._id}`} className="font-bold hover:underline">
              {comment.author.username}
            </Link>
            <span className="text-twitter-gray-500">@{comment.author.handle}</span>
            <span className="text-twitter-gray-500">·</span>
            <span className="text-twitter-gray-500">
              {formatDistanceToNow(new Date(comment.createdAt), { locale: zhCN, addSuffix: true })}
            </span>
          </div>

          {/* 评论内容 */}
          <div className="text-base mb-3 whitespace-pre-wrap break-words">
            {processContent(comment.content)}
          </div>

          {/* 媒体内容 */}
          {comment.media && comment.media.length > 0 && (
            <div className="grid gap-2 mb-3">
              {comment.media.map((media, index) => (
                <div key={index} className="relative">
                  <img
                    src={media.url}
                    alt=""
                    className="w-full h-48 object-cover rounded-xl"
                  />
                </div>
              ))}
            </div>
          )}

          {/* 互动按钮 */}
          <div className="flex justify-between max-w-md">
            <button
              onClick={() => onReply(comment)}
              className="group flex items-center text-twitter-gray-500 hover:text-twitter-blue"
            >
              <div className="p-2 rounded-full group-hover:bg-twitter-blue/10">
                💬
              </div>
              <span className="text-sm">{comment.replyCount || 0}</span>
            </button>

            <button
              onClick={handleLike}
              className={`group flex items-center ${
                isLiked ? 'text-twitter-red' : 'text-twitter-gray-500 hover:text-twitter-red'
              }`}
            >
              <div className="p-2 rounded-full group-hover:bg-twitter-red/10">
                ❤️
              </div>
              <span className="text-sm">{comment.likeCount || 0}</span>
            </button>

            <button
              onClick={() => setShowActions(!showActions)}
              className="group flex items-center text-twitter-gray-500 hover:text-twitter-blue"
            >
              <div className="p-2 rounded-full group-hover:bg-twitter-blue/10">
                ⋯
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 展开的操作菜单 */}
      {showActions && (
        <div className="absolute right-4 mt-2 w-48 bg-white dark:bg-twitter-gray-800 rounded-xl shadow-lg border border-twitter-gray-200 dark:border-twitter-gray-700">
          <button className="w-full px-4 py-3 text-left text-twitter-red hover:bg-twitter-gray-100 dark:hover:bg-twitter-gray-700 rounded-t-xl">
            举报
          </button>
          <button className="w-full px-4 py-3 text-left hover:bg-twitter-gray-100 dark:hover:bg-twitter-gray-700">
            分享
          </button>
          <button className="w-full px-4 py-3 text-left hover:bg-twitter-gray-100 dark:hover:bg-twitter-gray-700 rounded-b-xl">
            复制链接
          </button>
        </div>
      )}
    </article>
  );
}

export default Comment; 