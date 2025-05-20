import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../services/api';
import UserProfileCard from './UserProfileCard';
import InfiniteScroll from './InfiniteScroll';

const UserList = ({
  type, // 'followers' | 'following' | 'suggestions'
  userId,
  className = '',
}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const fetchUsers = async (pageNum) => {
    try {
      let response;
      switch (type) {
        case 'followers':
          response = await apiService.getFollowers(userId, pageNum);
          break;
        case 'following':
          response = await apiService.getFollowing(userId, pageNum);
          break;
        case 'suggestions':
          response = await apiService.getSuggestedUsers(pageNum);
          break;
        default:
          throw new Error('Invalid user list type');
      }

      if (pageNum === 1) {
        setUsers(response.users);
      } else {
        setUsers(prev => [...prev, ...response.users]);
      }

      setHasMore(response.hasMore);
    } catch (error) {
      console.error(`Failed to fetch ${type}:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [type, userId]);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchUsers(nextPage);
  };

  const getTitle = () => {
    switch (type) {
      case 'followers':
        return '粉丝';
      case 'following':
        return '关注';
      case 'suggestions':
        return '推荐关注';
      default:
        return '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h2 className="text-xl font-bold">{getTitle()}</h2>

      <InfiniteScroll
        data={users}
        fetchMore={loadMore}
        hasMore={hasMore}
        loading={loading}
        renderItem={(user) => (
          <UserProfileCard
            key={user.id}
            user={user}
            showStats={type !== 'suggestions'}
            showBio={type !== 'suggestions'}
          />
        )}
      />

      {!loading && users.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {type === 'suggestions'
            ? '暂无推荐用户'
            : type === 'followers'
            ? '暂无粉丝'
            : '暂无关注'}
        </div>
      )}
    </div>
  );
};

export default UserList; 