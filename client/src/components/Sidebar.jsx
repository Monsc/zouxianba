import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: '🏠', label: '首页' },
    { path: '/explore', icon: '🔍', label: '探索' },
    { path: '/notifications', icon: '🔔', label: '通知' },
    { path: '/messages', icon: '✉️', label: '消息' },
    { path: '/bookmarks', icon: '🔖', label: '书签' },
    { path: '/lists', icon: '📋', label: '列表' },
    { path: `/profile/${user?._id}`, icon: '👤', label: '个人资料' },
    { path: '/settings', icon: '⚙️', label: '设置' },
  ];

  return (
    <div className="h-full flex flex-col justify-between py-4">
      {/* 导航菜单 */}
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-4 px-4 py-3 rounded-full transition-colors ${
              location.pathname === item.path
                ? 'text-twitter-blue font-bold'
                : 'text-twitter-gray-700 dark:text-twitter-gray-300 hover:bg-twitter-gray-100 dark:hover:bg-twitter-gray-800'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-lg">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* 发帖按钮 */}
      <div className="px-4">
        <button className="w-full bg-twitter-blue hover:bg-twitter-blueHover text-white font-bold py-3 px-4 rounded-full transition-colors">
          发帖
        </button>
      </div>

      {/* 用户信息 */}
      {user && (
        <div className="mt-auto px-4">
          <div className="flex items-center space-x-3 p-3 rounded-full hover:bg-twitter-gray-100 dark:hover:bg-twitter-gray-800 transition-colors cursor-pointer">
            <img
              src={user.avatar || 'https://via.placeholder.com/40'}
              alt={user.username}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold truncate">{user.username}</p>
              <p className="text-twitter-gray-500 text-sm truncate">
                @{user.handle}
              </p>
            </div>
            <span className="text-twitter-gray-500">⋯</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
