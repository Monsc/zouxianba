import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

function Header() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-twitter-gray-900/80 backdrop-blur-md border-b border-twitter-gray-200 dark:border-twitter-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-twitter-blue text-2xl font-bold">
            走线吧
          </Link>

          {/* 搜索框 */}
          <div className="hidden md:block flex-1 max-w-xl mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索走线吧"
                className="w-full px-4 py-2 bg-twitter-gray-100 dark:bg-twitter-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-twitter-blue"
              />
              <span className="absolute right-3 top-2.5 text-twitter-gray-500">🔍</span>
            </div>
          </div>

          {/* 右侧操作区 */}
          <div className="flex items-center space-x-4">
            {/* 主题切换 */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-twitter-gray-100 dark:hover:bg-twitter-gray-800 transition-colors"
            >
              {theme === 'dark' ? '🌞' : '🌙'}
            </button>

            {/* 通知 */}
            <button className="p-2 rounded-full hover:bg-twitter-gray-100 dark:hover:bg-twitter-gray-800 transition-colors">
              🔔
            </button>

            {/* 用户头像 */}
            {user && (
              <Link to="/profile" className="flex items-center space-x-2">
                <img
                  src={user.avatar || 'https://via.placeholder.com/40'}
                  alt={user.username}
                  className="w-10 h-10 rounded-full"
                />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
