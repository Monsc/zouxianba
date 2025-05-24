import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Avatar } from './Avatar';

export const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = path => {
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
            <h3 className="font-medium text-[#1da1f2]">{user?.username}</h3>
            <p className="text-sm text-[#1da1f2]/60">@{user?.handle}</p>
          </div>
        </Link>
      </div>

      <nav className="space-y-1">
        {Array.isArray(navItems) &&
          navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-2 rounded-full transition-colors text-base font-medium
                ${isActive(item.path)
                  ? 'bg-[#1da1f2]/10 text-[#1da1f2] font-bold shadow'
                  : 'text-[#1da1f2]/80 hover:bg-[#1da1f2]/10 hover:text-[#1da1f2] dark:hover:bg-[#1a8cd8]/10 dark:hover:text-[#1a8cd8]'}
              `}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
      </nav>

      <div className="p-4">
        <button className="w-full bg-[#1da1f2] text-white rounded-full py-2 hover:bg-[#1a8cd8] transition-colors font-bold shadow-lg">
          Post
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
