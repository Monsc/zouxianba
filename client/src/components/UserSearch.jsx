import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '../hooks/useDebounce';
import { apiService } from '../services/api';
import UserProfileCard from './UserProfileCard';

const UserSearch = ({ className = '' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = event => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await apiService.searchUsers(debouncedQuery);
        setResults(response.users);
      } catch (error) {
        console.error('Failed to search users:', error);
      } finally {
        setLoading(false);
      }
    };

    searchUsers();
  }, [debouncedQuery]);

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder="搜索用户..."
          className="w-full px-4 py-2 pl-10 bg-gray-100 dark:bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-twitter-blue"
        />
        <span className="absolute left-3 top-2.5 text-gray-500">🔍</span>
        {loading && (
          <span className="absolute right-3 top-2.5">
            <div className="w-5 h-5 border-2 border-twitter-blue border-t-transparent rounded-full animate-spin" />
          </span>
        )}
      </div>

      <AnimatePresence>
        {showResults && (query.trim() || results.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-h-96 overflow-y-auto"
          >
            {results.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {results.map(user => (
                  <div
                    key={user.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <UserProfileCard user={user} showStats={false} showBio={false} />
                  </div>
                ))}
              </div>
            ) : query.trim() && !loading ? (
              <div className="p-4 text-center text-gray-500">未找到相关用户</div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserSearch;
