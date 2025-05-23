import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../Avatar';

export const AdminLayout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = path => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/posts', label: 'Posts', icon: '📝' },
    { path: '/admin/comments', label: 'Comments', icon: '💬' },
    { path: '/admin/email-templates', label: 'Email Templates', icon: '📧' },
    { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
    { path: '/admin/logs', label: 'System Logs', icon: '📋' },
    { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/admin" className="text-xl font-bold text-gray-800 dark:text-white">
              Admin Panel
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Back to Site
              </Link>
              <div className="flex items-center space-x-2">
                <Avatar src={user?.avatar} alt={user?.username} size="sm" />
                <span className="text-gray-700 dark:text-gray-300">{user?.username}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <aside className="w-64 space-y-4">
            <nav className="space-y-1">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </aside>

          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
