import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './Button';
import { Search } from 'lucide-react';

export const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* 左侧导航栏 */}
      <div className="fixed left-0 top-0 h-screen w-64 border-r border-gray-200 dark:border-gray-800">
        <div className="flex flex-col h-full p-4">
          <Link to="/" className="text-2xl font-bold text-blue-500 mb-8">
            Social App
          </Link>
          <nav className="space-y-2">
            <Link
              to="/feed"
              className={`flex items-center space-x-3 p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 ${
                location.pathname === '/feed' ? 'font-bold' : ''
              }`}
            >
              <span className="text-xl">🏠</span>
              <span>首页</span>
            </Link>
            <Link
              to="/explore"
              className="flex items-center space-x-3 p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="text-xl">🔍</span>
              <span>探索</span>
            </Link>
            {user && (
              <>
                <Link
                  to="/notifications"
                  className="flex items-center space-x-3 p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <span className="text-xl">🔔</span>
                  <span>通知</span>
                </Link>
                <Link
                  to="/messages"
                  className="flex items-center space-x-3 p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <span className="text-xl">✉️</span>
                  <span>私信</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <span className="text-xl">👤</span>
                  <span>个人主页</span>
                </Link>
              </>
            )}
          </nav>
          {user && (
            <Button className="mt-4 w-full rounded-full" size="lg">
              发帖
            </Button>
          )}
          <div className="mt-auto">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center space-x-3 p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="text-xl">{theme === 'dark' ? '🌞' : '🌙'}</span>
              <span>{theme === 'dark' ? '浅色模式' : '深色模式'}</span>
            </button>
            {user && (
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span className="text-xl">🚪</span>
                <span>退出登录</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 中间内容区 */}
      <div className="ml-64 min-h-screen border-x border-gray-200 dark:border-gray-800">
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
          <div className="px-4 py-3">
            <h1 className="text-xl font-bold">
              {location.pathname === '/feed' && '首页'}
              {location.pathname === '/explore' && '探索'}
              {location.pathname === '/notifications' && '通知'}
              {location.pathname === '/messages' && '私信'}
              {location.pathname.startsWith('/profile') && '个人主页'}
            </h1>
          </div>
        </div>
        <main className="max-w-2xl mx-auto">
          {children}
        </main>
      </div>

      {/* 右侧边栏 */}
      <div className="fixed right-0 top-0 h-screen w-80 border-l border-gray-200 dark:border-gray-800 p-4">
        <div className="sticky top-4">
          {/* 搜索框 */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="搜索"
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 推荐关注 */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 mb-4">
            <h2 className="text-xl font-bold mb-4">推荐关注</h2>
            {/* 这里添加推荐用户列表 */}
          </div>

          {/* 趋势话题 */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
            <h2 className="text-xl font-bold mb-4">趋势话题</h2>
            {/* 这里添加趋势话题列表 */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
