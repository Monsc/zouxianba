import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  const navItems = [
    { path: '/', icon: 'icon-home', label: 'Home' },
    { path: '/search', icon: 'icon-search', label: 'Search' },
    { path: '/notifications', icon: 'icon-bell', label: 'Notifications' },
    { path: `/profile/${user.id}`, icon: 'icon-user', label: 'Profile' },
  ];

  return (
    <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center bg-white/95 dark:bg-[#15202b]/95 border-t border-gray-200 dark:border-gray-800 shadow-lg md:hidden transition-colors duration-200">
      {navItems.map(item => (
        <button
          key={item.path}
          className={`nav-item flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors duration-150 text-xs font-medium ${location.pathname === item.path ? 'active text-primary' : 'text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary'}`}
          onClick={() => navigate(item.path)}
        >
          <i className={`${item.icon} text-xl`} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default BottomNav; 