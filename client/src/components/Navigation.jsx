import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navigation = () => {
  const navItems = [
    { to: '/', icon: '🏠', label: '首页' },
    { to: '/explore', icon: '🔍', label: '探索' },
    { to: '/notifications', icon: '🔔', label: '通知' },
    { to: '/messages', icon: '✉️', label: '消息' },
    { to: '/bookmarks', icon: '🔖', label: '书签' },
    { to: '/lists', icon: '📋', label: '列表' },
    { to: '/profile', icon: '👤', label: '个人资料' },
  ];

  return (
    <nav className="space-y-2">
      {navItems.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex items-center space-x-4 px-4 py-3 rounded-full transition-colors text-base font-medium
              ${isActive ? 'bg-[#1da1f2]/10 text-[#1da1f2] font-bold shadow' : 'text-[#1da1f2]/80 hover:bg-[#1da1f2]/10 hover:text-[#1da1f2] dark:hover:bg-[#1a8cd8]/10 dark:hover:text-[#1a8cd8]'}
            `
          }
        >
          <motion.span whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="text-xl">
            {item.icon}
          </motion.span>
          <span className="font-medium">{item.label}</span>
        </NavLink>
      ))}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-4 bg-[#1da1f2] text-white rounded-full py-3 font-bold hover:bg-[#1a8cd8] transition-colors shadow-lg"
      >
        发推
      </motion.button>
    </nav>
  );
};

export default Navigation;
