import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Avatar from './ui/Avatar';
import UserInteraction from './UserInteraction';

const UserProfileCard = ({
  user,
  showStats = true,
  showBio = true,
  showFollowButton = true,
  className = '',
}) => {
  const { user: currentUser } = useAuth();
  const isCurrentUser = currentUser?.id === user.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 ${className}`}
    >
      <div className="flex items-start space-x-4">
        <Link to={`/profile/${user.username}`}>
          <Avatar
            src={user.avatar}
            username={user.username}
            size="lg"
            className="hover:opacity-90 transition-opacity"
          />
        </Link>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <Link to={`/profile/${user.username}`} className="hover:underline">
                <h3 className="text-lg font-bold">{user.name}</h3>
                <p className="text-gray-500">@{user.username}</p>
              </Link>

              {showBio && user.bio && (
                <p className="mt-2 text-gray-600 dark:text-gray-300">{user.bio}</p>
              )}

              {showStats && (
                <div className="flex space-x-4 mt-3 text-sm text-gray-500">
                  <Link to={`/profile/${user.username}/following`} className="hover:underline">
                    <span className="font-bold text-gray-900 dark:text-white">
                      {user.followingCount}
                    </span>{' '}
                    关注
                  </Link>
                  <Link to={`/profile/${user.username}/followers`} className="hover:underline">
                    <span className="font-bold text-gray-900 dark:text-white">
                      {user.followersCount}
                    </span>{' '}
                    粉丝
                  </Link>
                  <Link to={`/profile/${user.username}/posts`} className="hover:underline">
                    <span className="font-bold text-gray-900 dark:text-white">
                      {user.postsCount}
                    </span>{' '}
                    帖子
                  </Link>
                </div>
              )}
            </div>

            {showFollowButton && !isCurrentUser && (
              <UserInteraction userId={user.id} initialIsFollowing={user.isFollowing} />
            )}
          </div>

          {user.location && (
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span className="mr-2">📍</span>
              {user.location}
            </div>
          )}

          {user.website && (
            <a
              href={user.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center text-sm text-twitter-blue hover:underline"
            >
              <span className="mr-2">🔗</span>
              {user.website}
            </a>
          )}

          {user.joinedDate && (
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span className="mr-2">📅</span>
              加入于 {new Date(user.joinedDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default UserProfileCard;
