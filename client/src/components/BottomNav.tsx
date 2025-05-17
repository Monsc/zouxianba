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
    <nav className="bottom-nav">
      {navItems.map(item => (
        <button
          key={item.path}
          className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <i className={item.icon} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default BottomNav; 