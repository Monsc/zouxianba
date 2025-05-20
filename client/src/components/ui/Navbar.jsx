import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from './Avatar';
import { Button } from './button';

const NavItem = ({ to, icon, label, active }) => (
  <Link to={to} className="block">
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center space-x-4 p-3 rounded-full ${
        active ? 'font-bold' : 'text-gray-600 dark:text-gray-300'
      } hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="hidden lg:block">{label}</span>
    </motion.div>
  </Link>
);

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/', icon: '🏠', label: '首页' },
    { to: '/explore', icon: '🔍', label: '探索' },
    { to: '/notifications', icon: '🔔', label: '通知' },
    { to: '/messages', icon: '✉️', label: '消息' },
    { to: '/bookmarks', icon: '🔖', label: '书签' },
    { to: '/lists', icon: '📋', label: '列表' },
    { to: `/profile/${user?.username}`, icon: '👤', label: '个人资料' },
    { to: '/settings', icon: '⚙️', label: '设置' },
  ];

  return (
    <nav className="fixed left-0 top-0 h-screen w-16 lg:w-64 p-4 flex flex-col justify-between border-r border-gray-200 dark:border-gray-700">
      <div className="space-y-2">
        <Link to="/" className="block p-3">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="text-2xl font-bold text-twitter-blue"
          >
            🐦
          </motion.div>
        </Link>

        <div className="space-y-1">
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              {...item}
              active={location.pathname === item.to}
            />
          ))}
        </div>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          className="mt-4 hidden lg:block"
        >
          发推
        </Button>
      </div>

      <div className="flex items-center space-x-2 p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
        <Avatar src={user?.avatar} username={user?.username} size="sm" />
        <div className="hidden lg:block flex-1">
          <div className="font-bold">{user?.username}</div>
          <div className="text-sm text-gray-500">@{user?.handle}</div>
        </div>
        <button
          onClick={logout}
          className="hidden lg:block text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          ⋮
        </button>
      </div>
    </nav>
  );
};

export default Navbar; 