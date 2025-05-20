import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function MobileNav() {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', icon: '🏠', label: '首页' },
    { path: '/explore', icon: '🔍', label: '发现' },
    { path: '/notifications', icon: '🔔', label: '通知' },
    { path: '/messages', icon: '💬', label: '消息' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-twitter-gray-900 border-t border-twitter-gray-200 dark:border-twitter-gray-800 md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center flex-1 h-full ${
              isActive(item.path)
                ? 'text-twitter-blue'
                : 'text-twitter-gray-500 hover:text-twitter-blue'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
        <Link
          to={`/profile/${user?._id}`}
          className={`flex flex-col items-center justify-center flex-1 h-full ${
            isActive(`/profile/${user?._id}`)
              ? 'text-twitter-blue'
              : 'text-twitter-gray-500 hover:text-twitter-blue'
          }`}
        >
          <img
            src={user?.avatar || 'https://via.placeholder.com/24'}
            alt={user?.username}
            className="w-6 h-6 rounded-full"
          />
          <span className="text-xs mt-1">我</span>
        </Link>
      </div>
    </div>
  );
}

export default MobileNav; 