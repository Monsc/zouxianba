import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Avatar } from './Avatar';

export const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/feed', label: 'Home', icon: '🏠' },
    { path: '/explore', label: 'Explore', icon: '🔍' },
    { path: '/notifications', label: 'Notifications', icon: '🔔' },
    { path: '/messages', label: 'Messages', icon: '✉️' },
    { path: '/bookmarks', label: 'Bookmarks', icon: '🔖' },
    { path: '/lists', label: 'Lists', icon: '📋' },
    { path: `/profile/${user?.username}`, label: 'Profile', icon: '👤' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 space-y-4">
      <div className="p-4">
        <Link to={`/profile/${user?.username}`} className="flex items-center space-x-3">
          <Avatar src={user?.avatar} alt={user?.username} />
          <div>
            <h3 className="font-medium">{user?.username}</h3>
            <p className="text-sm text-gray-500">@{user?.handle}</p>
          </div>
        </Link>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => (
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

      <div className="p-4">
        <button className="w-full bg-blue-600 text-white rounded-full py-2 hover:bg-blue-700 transition-colors">
          Post
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
