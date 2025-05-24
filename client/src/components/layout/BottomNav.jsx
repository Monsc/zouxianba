import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Bell, Mail } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const navItems = [
    { name: '首页', href: '/', icon: Home },
    { name: '搜索', href: '/search', icon: Search },
    { name: '通知', href: '/notifications', icon: Bell },
    { name: '消息', href: '/messages', icon: Mail },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center h-14">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`flex flex-col items-center justify-center flex-1 h-full ${
              isActive ? 'text-primary' : 'text-gray-500'
            }`}
          >
            <Icon className="h-6 w-6" />
            <span className="text-xs mt-1">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default BottomNav; 