import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="header sticky top-0 z-50 shadow-sm bg-white/90 dark:bg-[#15202b]/90 border-b border-gray-200 dark:border-gray-800 backdrop-blur-md transition-colors duration-200">
      <div className="header-content flex items-center justify-between max-w-7xl mx-auto px-4 py-2">
        {/* 左侧头像 */}
        {user && (
          <div className="flex items-center">
            <img
              src={user.avatar || '/default-avatar.png'}
              alt={user.username}
              className="header-avatar w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 object-cover shadow hover:scale-105 transition-transform duration-200 cursor-pointer"
              onClick={() => navigate(`/profile/${user._id}`)}
            />
          </div>
        )}
        
        {/* 中间应用名 */}
        <h1
          className="header-title text-2xl font-extrabold text-primary cursor-pointer tracking-tight hover:opacity-80 transition-opacity duration-150"
          onClick={() => navigate('/')}
        >
          ZouXianBa
        </h1>

        {/* 右侧占位，保持布局平衡 */}
        <div className="w-10" />
      </div>
    </header>
  );
}

export default Header; 