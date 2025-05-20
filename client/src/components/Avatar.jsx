import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import LazyImage from './LazyImage';

function Avatar({
  user,
  size = 'md',
  showPreview = false,
  linkToProfile = true,
  className = '',
}) {
  const [showModal, setShowModal] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-32 h-32',
  };

  const avatarContent = (
    <LazyImage
      src={user.avatar}
      alt={user.username}
      className={`rounded-full ${sizeClasses[size]} ${className}`}
      placeholder={
        <div className="w-full h-full flex items-center justify-center bg-twitter-gray-200 dark:bg-twitter-gray-800">
          <span className="text-lg font-bold text-twitter-gray-500">
            {user.username.charAt(0).toUpperCase()}
          </span>
        </div>
      }
    />
  );

  const wrappedContent = linkToProfile ? (
    <Link to={`/users/${user._id}`}>{avatarContent}</Link>
  ) : (
    avatarContent
  );

  return (
    <>
      <div
        className="relative"
        onClick={() => showPreview && setShowModal(true)}
        style={{ cursor: showPreview ? 'pointer' : 'default' }}
      >
        {wrappedContent}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-2xl w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <LazyImage
                src={user.avatar}
                alt={user.username}
                className="w-full h-auto rounded-lg"
              />
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Avatar; 