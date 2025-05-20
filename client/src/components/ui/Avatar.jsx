import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Avatar = ({
  src,
  alt,
  size = 'md',
  username,
  linkToProfile = true,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const avatarContent = (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt || username}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-500 dark:text-gray-400">
            {username?.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </motion.div>
  );

  if (linkToProfile && username) {
    return (
      <Link to={`/profile/${username}`} className="block">
        {avatarContent}
      </Link>
    );
  }

  return avatarContent;
};

export default Avatar; 