import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';

function Post({ post, onLike, onRepost, onComment, onBookmark }) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isReposted, setIsReposted] = useState(post.isReposted);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);
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
      await onLike(post._id);
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Like failed:', error);
    }
  };

  const handleRepost = async () => {
    try {
      await onRepost(post._id);
      setIsReposted(!isReposted);
    } catch (error) {
      console.error('Repost failed:', error);
    }
  };

  const handleBookmark = async () => {
    try {
      await onBookmark(post._id);
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Bookmark failed:', error);
    }
  };

  return (
    <article className="border-b border-twitter-gray-200 dark:border-twitter-gray-800 p-4 hover:bg-twitter-gray-50 dark:hover:bg-twitter-gray-900/50 transition-colors">
      {/* 转发信息 */}
      {post.repostFrom && (
        <div className="flex items-center text-twitter-gray-500 text-sm mb-2">
          <span className="mr-2">🔄</span>
          <Link to={`/profile/${post.repostFrom._id}`} className="hover:underline">
            {post.repostFrom.username} 转发了
          </Link>
        </div>
      )}

      <div className="flex space-x-3">
        {/* 用户头像 */}
        <Link to={`/profile/${post.author._id}`} className="flex-shrink-0">
          <img
            src={post.author.avatar || 'https://via.placeholder.com/48'}
            alt={post.author.username}
            className="w-12 h-12 rounded-full"
          />
        </Link>

        {/* 内容区 */}
        <div className="flex-1 min-w-0">
          {/* 用户信息和时间 */}
          <div className="flex items-center space-x-2 mb-1">
            <Link to={`/profile/${post.author._id}`} className="font-bold hover:underline">
              {post.author.username}
            </Link>
            <span className="text-twitter-gray-500">@{post.author.handle}</span>
            <span className="text-twitter-gray-500">·</span>
            <Link to={`/post/${post._id}`} className="text-twitter-gray-500 hover:underline">
              {formatDistanceToNow(new Date(post.createdAt), { locale: zhCN, addSuffix: true })}
            </Link>
          </div>

          {/* 帖子内容 */}
          <div className="text-base mb-3 whitespace-pre-wrap break-words">
            {processContent(post.content)}
          </div>

          {/* 媒体内容 */}
          {post.media && post.media.length > 0 && (
            <div className={`grid gap-2 mb-3 ${
              post.media.length === 1 ? 'grid-cols-1' :
              post.media.length === 2 ? 'grid-cols-2' :
              post.media.length === 3 ? 'grid-cols-2' :
              'grid-cols-2'
            }`}>
              {post.media.map((media, index) => (
                <div
                  key={index}
                  className={`relative ${
                    post.media.length === 3 && index === 0 ? 'row-span-2' : ''
                  }`}
                >
                  <img
                    src={media.url}
                    alt=""
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
              ))}
            </div>
          )}

          {/* 互动按钮 */}
          <div className="flex justify-between max-w-md">
            <button
              onClick={() => onComment(post._id)}
              className="group flex items-center text-twitter-gray-500 hover:text-twitter-blue"
            >
              <div className="p-2 rounded-full group-hover:bg-twitter-blue/10">
                💬
              </div>
              <span className="text-sm">{post.commentCount || 0}</span>
            </button>

            <button
              onClick={handleRepost}
              className={`group flex items-center ${
                isReposted ? 'text-twitter-green' : 'text-twitter-gray-500 hover:text-twitter-green'
              }`}
            >
              <div className="p-2 rounded-full group-hover:bg-twitter-green/10">
                🔄
              </div>
              <span className="text-sm">{post.repostCount || 0}</span>
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
              <span className="text-sm">{post.likeCount || 0}</span>
            </button>

            <button
              onClick={handleBookmark}
              className={`group flex items-center ${
                isBookmarked ? 'text-twitter-blue' : 'text-twitter-gray-500 hover:text-twitter-blue'
              }`}
            >
              <div className="p-2 rounded-full group-hover:bg-twitter-blue/10">
                🔖
              </div>
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

export default Post; 