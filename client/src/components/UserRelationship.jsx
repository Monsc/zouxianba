import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../services/api';
import UserProfileCard from './UserProfileCard';

const UserRelationship = ({ userId, className = '' }) => {
  const [commonFollowers, setCommonFollowers] = useState([]);
  const [commonFollowing, setCommonFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('followers');

  useEffect(() => {
    const fetchRelationships = async () => {
      setLoading(true);
      try {
        const [followersRes, followingRes] = await Promise.all([
          apiService.getCommonFollowers(userId),
          apiService.getCommonFollowing(userId),
        ]);
        setCommonFollowers(followersRes.users);
        setCommonFollowing(followingRes.users);
      } catch (error) {
        console.error('Failed to fetch relationships:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelationships();
  }, [userId]);

  const tabs = [
    { id: 'followers', label: '共同粉丝', count: commonFollowers.length },
    { id: 'following', label: '共同关注', count: commonFollowing.length },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 标签页 */}
      <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-twitter-blue border-b-2 border-twitter-blue'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
            <span className="ml-2 text-sm text-gray-500">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center py-8"
          >
            <div className="w-8 h-8 border-2 border-twitter-blue border-t-transparent rounded-full animate-spin" />
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {(activeTab === 'followers' ? commonFollowers : commonFollowing).map(
              (user) => (
                <UserProfileCard
                  key={user.id}
                  user={user}
                  showStats={false}
                  showBio={false}
                />
              )
            )}

            {activeTab === 'followers' && commonFollowers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                暂无共同粉丝
              </div>
            )}

            {activeTab === 'following' && commonFollowing.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                暂无共同关注
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserRelationship; 