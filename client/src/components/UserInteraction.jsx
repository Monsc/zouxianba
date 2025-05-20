import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

const UserInteraction = ({
  userId,
  postId,
  initialLikes = 0,
  initialComments = 0,
  initialIsFollowing = false,
  onLike,
  onComment,
  onFollow,
}) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState(initialLikes);
  const [comments, setComments] = useState(initialComments);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await apiService.likePost(postId);
      setLikes(prev => (isLiked ? prev - 1 : prev + 1));
      setIsLiked(!isLiked);
      onLike?.(!isLiked);
    } catch (error) {
      console.error('Failed to like post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await apiService.followUser(userId);
      setIsFollowing(!isFollowing);
      onFollow?.(!isFollowing);
    } catch (error) {
      console.error('Failed to follow user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComment = () => {
    if (!user) return;
    onComment?.();
  };

  return (
    <div className="flex items-center space-x-6">
      {/* 关注按钮 */}
      {userId !== user?.id && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleFollow}
          disabled={isLoading}
          className={`px-4 py-2 rounded-full font-medium transition-colors ${
            isFollowing
              ? 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
              : 'bg-twitter-blue text-white hover:bg-twitter-blue-dark'
          }`}
        >
          {isFollowing ? '已关注' : '关注'}
        </motion.button>
      )}

      {/* 互动按钮组 */}
      <div className="flex items-center space-x-4">
        {/* 点赞按钮 */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleLike}
          disabled={isLoading}
          className={`flex items-center space-x-2 ${
            isLiked ? 'text-red-500' : 'text-gray-500'
          }`}
        >
          <span className="text-xl">{isLiked ? '❤️' : '🤍'}</span>
          <span>{likes}</span>
        </motion.button>

        {/* 评论按钮 */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleComment}
          className="flex items-center space-x-2 text-gray-500"
        >
          <span className="text-xl">💬</span>
          <span>{comments}</span>
        </motion.button>

        {/* 分享按钮 */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            navigator.share({
              title: '分享帖子',
              text: '看看这个有趣的帖子！',
              url: window.location.href,
            }).catch(console.error);
          }}
          className="flex items-center space-x-2 text-gray-500"
        >
          <span className="text-xl">📤</span>
        </motion.button>
      </div>
    </div>
  );
};

export default UserInteraction; 