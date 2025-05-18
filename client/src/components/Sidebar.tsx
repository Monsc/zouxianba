import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  if (!user) return null;

  const navItems = [
    { path: '/', icon: 'icon-home', label: '首页' },
    { path: '/search', icon: 'icon-search', label: '搜索' },
    { path: '/notifications', icon: 'icon-bell', label: '通知' },
    { path: `/profile/${user._id}`, icon: 'icon-user', label: '个人主页' },
    { path: '/settings', icon: 'icon-settings', label: '设置' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <aside className="sidebar-left hidden lg:flex flex-col w-64 p-4 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-[#192734]">
      {/* 用户信息 */}
      <div className="user-info flex items-center gap-3 mb-6 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
           onClick={() => navigate(`/profile/${user._id}`)}>
        <img
          src={user.avatar || '/default-avatar.png'}
          alt={user.username}
          className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700 object-cover"
        />
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 dark:text-white">{user.username}</span>
          <span className="text-sm text-gray-500">@{user.handle}</span>
        </div>
      </div>

      {/* 主导航 */}
      <nav className="flex flex-col gap-2">
        {navItems.map(item => (
          <button
            key={item.path}
            className={`nav-item flex items-center gap-4 px-4 py-3 rounded-full text-lg font-medium transition-colors ${
              location.pathname === item.path
                ? 'text-primary bg-primary/10'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            onClick={() => navigate(item.path)}
          >
            <i className={`${item.icon} text-xl`} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* 发帖按钮 */}
      <button
        className="post-button mt-4 w-full bg-primary text-white rounded-full py-3 font-bold text-lg hover:bg-primary-hover transition-colors"
        onClick={() => navigate('/')}
      >
        发帖
      </button>

      {/* 登出按钮 */}
      <button
        className="logout-button mt-auto mb-4 flex items-center gap-4 px-4 py-3 rounded-full text-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        onClick={handleLogout}
      >
        <i className="icon-logout text-xl" />
        <span>登出</span>
      </button>
    </aside>
  );
}

export default Sidebar; 