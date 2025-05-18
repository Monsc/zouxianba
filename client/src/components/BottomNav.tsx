import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUnreadNotificationCount, getUnreadMessageCount } from '../services/api';

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [unreadMsgCount, setUnreadMsgCount] = React.useState(0);

  React.useEffect(() => {
    let timer: any;
    const fetchUnread = async () => {
      try {
        const data = await getUnreadNotificationCount();
        setUnreadCount(data.count || 0);
      } catch {}
    };
    fetchUnread();
    timer = setInterval(fetchUnread, 20000);
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    let timer: any;
    const fetchUnreadMsg = async () => {
      try {
        const data = await getUnreadMessageCount();
        setUnreadMsgCount(data.count || 0);
      } catch {}
    };
    fetchUnreadMsg();
    timer = setInterval(fetchUnreadMsg, 20000);
    return () => clearInterval(timer);
  }, []);

  if (!user) return null;

  const navItems = [
    { path: '/', icon: 'icon-home', label: '首页' },
    { path: '/discover', icon: 'icon-search', label: '发现' },
    { path: '/messages', icon: 'icon-envelope', label: '私信' },
    { path: '/notifications', icon: 'icon-bell', label: '通知' },
    { path: `/profile/${user.id}`, icon: 'icon-user', label: '个人主页' },
  ];

  return (
    <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center bg-white/95 dark:bg-[#15202b]/95 border-t border-gray-200 dark:border-gray-800 shadow-lg md:hidden backdrop-blur-md">
      {navItems.map(item => (
        <button
          key={item.path}
          className={`nav-item flex flex-col items-center gap-1 px-4 py-2 rounded-full transition-all duration-200 ${
            location.pathname === item.path
              ? 'text-primary scale-110'
              : 'text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary'
          }`}
          onClick={() => navigate(item.path)}
        >
          <span className="relative">
            <i className={`${item.icon} text-2xl`} />
            {item.path === '/notifications' && unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
            {item.path === '/messages' && unreadMsgCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center animate-pulse">
                {unreadMsgCount > 99 ? '99+' : unreadMsgCount}
              </span>
            )}
          </span>
          <span className="text-xs font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default BottomNav; 