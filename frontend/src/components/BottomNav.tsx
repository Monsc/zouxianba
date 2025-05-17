import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

export const BottomNav = () => {
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/explore', icon: '🔍', label: 'Explore' },
    { path: '/notifications', icon: '🔔', label: 'Notifications' },
    { path: `/profile/${user?.id}`, icon: '👤', label: 'Profile' },
  ];

  return (
    <nav
      className="bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--bg-color)',
        borderTop: '1px solid var(--border-color)',
        padding: '8px 16px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <Link
        to="/"
        className={`nav-item ${isActive('/') ? 'active' : ''}`}
        style={{
          color: isActive('/') ? 'var(--primary-color)' : 'var(--text-color)',
          textDecoration: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <i className="fas fa-home" style={{ fontSize: '1.2em' }}></i>
        <span style={{ fontSize: '0.8em' }}>Home</span>
      </Link>

      <Link
        to="/search"
        className={`nav-item ${isActive('/search') ? 'active' : ''}`}
        style={{
          color: isActive('/search') ? 'var(--primary-color)' : 'var(--text-color)',
          textDecoration: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <i className="fas fa-search" style={{ fontSize: '1.2em' }}></i>
        <span style={{ fontSize: '0.8em' }}>Search</span>
      </Link>

      <Link
        to="/messages"
        className={`nav-item ${isActive('/messages') ? 'active' : ''}`}
        style={{
          color: isActive('/messages') ? 'var(--primary-color)' : 'var(--text-color)',
          textDecoration: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <i className="fas fa-envelope" style={{ fontSize: '1.2em' }}></i>
        <span style={{ fontSize: '0.8em' }}>Messages</span>
      </Link>

      <Link
        to="/notifications"
        className={`nav-item ${isActive('/notifications') ? 'active' : ''}`}
        style={{
          color: isActive('/notifications') ? 'var(--primary-color)' : 'var(--text-color)',
          textDecoration: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          position: 'relative',
        }}
      >
        <i className="fas fa-bell" style={{ fontSize: '1.2em' }}></i>
        <span style={{ fontSize: '0.8em' }}>Notifications</span>
        {unreadCount > 0 && (
          <div
            className="notification-badge"
            style={{
              position: 'absolute',
              top: -5,
              right: -5,
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7em',
            }}
          >
            {unreadCount}
          </div>
        )}
      </Link>

      <Link
        to={`/profile/${user?.id}`}
        className={`nav-item ${isActive(`/profile/${user?.id}`) ? 'active' : ''}`}
        style={{
          color: isActive(`/profile/${user?.id}`) ? 'var(--primary-color)' : 'var(--text-color)',
          textDecoration: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <i className="fas fa-user" style={{ fontSize: '1.2em' }}></i>
        <span style={{ fontSize: '0.8em' }}>Profile</span>
      </Link>
    </nav>
  );
}; 