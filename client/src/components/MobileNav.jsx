import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, Search, Bell, Mail, User, Plus } from 'lucide-react';

function MobileNav({ unreadNotifications = 0, unreadMessages = 0 }) {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = path => location.pathname === path;

  const navItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/explore', icon: Search, label: '发现' },
    { path: '/notifications', icon: Bell, label: '通知', badge: unreadNotifications },
    { path: '/messages', icon: Mail, label: '消息', badge: unreadMessages },
  ];

  return (
    <>
      {/* 底部导航栏 */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-background border-t border-border md:hidden">
        <div className="flex justify-around items-center h-16 relative">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center flex-1 h-full relative transition-colors text-gray-900 dark:text-white` +
                  (isActive(item.path) ? ' text-primary' : ' text-muted-foreground hover:text-primary')}
              >
                <span className="relative">
                  <Icon className="w-6 h-6" />
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-1 min-w-[18px] text-center">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </span>
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
          {/* 个人中心 */}
          <Link
            to={user ? `/profile/${user._id}` : '/login'}
            className={`flex flex-col items-center justify-center flex-1 h-full text-gray-900 dark:text-white` +
              (isActive(`/profile/${user?._id}`) ? ' text-primary' : ' text-muted-foreground hover:text-primary')}
          >
            <span className="relative">
              <User className="w-6 h-6" />
            </span>
            <span className="text-xs mt-1">我</span>
          </Link>
        </div>
      </div>
      {/* 悬浮发帖主按钮（右下角） */}
      <Link
        to="/post/create"
        className="fixed z-50 bottom-20 right-5 md:hidden bg-primary text-white rounded-full shadow-xl p-4 flex items-center justify-center border-4 border-white dark:border-background hover:bg-primary/90 transition-transform active:scale-95 animate-fade-in"
        style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}
        aria-label="发帖"
      >
        <Plus className="w-7 h-7" />
      </Link>
    </>
  );
}

export default MobileNav;
