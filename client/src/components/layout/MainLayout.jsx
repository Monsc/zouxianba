import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationIcon } from '../NotificationIcon';
import {
  Home,
  Search,
  Bell,
  Mail,
  Bookmark,
  User,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import MobileNav from '../MobileNav';

const navItems = [
  { icon: Home, label: '首页', path: '/' },
  { icon: Search, label: '探索', path: '/explore' },
  { icon: Bell, label: '通知', path: '/notifications' },
  { icon: Mail, label: '消息', path: '/messages' },
  { icon: Bookmark, label: '书签', path: '/bookmarks' },
  { icon: User, label: '个人资料', path: '/profile' },
  { icon: Settings, label: '设置', path: '/settings' },
];

export default function MainLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const renderNavItem = ({ icon: Icon, label, path }) => {
    const isActive = location.pathname === path;
    return (
      <Link
        to={path}
        className={`flex items-center space-x-4 p-3 rounded-full transition-colors ${
          isActive
            ? 'text-blue-500 font-bold'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        <Icon className="w-6 h-6" />
        <span className="hidden md:block">{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* 移动端顶部导航栏 */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <Link to="/" className="text-blue-500 font-bold text-xl">
            Twitter
          </Link>
          <div className="w-6" />
        </div>
      </div>

      {/* 侧边栏导航 */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-200 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex-1 space-y-2">
            {navItems.map((item) => (
              <div key={item.path}>{renderNavItem(item)}</div>
            ))}
          </div>

          {user && (
            <div className="mt-auto">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-4 p-3 w-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <LogOut className="w-6 h-6" />
                <span className="hidden md:block">退出登录</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="md:ml-64 pt-16 md:pt-0">
        <main className="max-w-2xl mx-auto min-h-screen">
          {children}
        </main>
      </div>

      {/* 移动端底部导航栏 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="flex justify-around p-2">
          {navItems.slice(0, 4).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`p-2 rounded-full ${
                location.pathname === item.path
                  ? 'text-blue-500'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <item.icon className="w-6 h-6" />
            </Link>
          ))}
        </div>
      </div>

      {/* 移动端导航 */}
      <MobileNav />
    </div>
  );
}
