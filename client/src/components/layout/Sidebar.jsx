import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  TrendingUp,
  Users,
  Bell,
  Mail,
  Bookmark,
  User,
  Settings,
  Hash,
  Plus,
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const navItems = [
    { name: '首页', href: '/', icon: Home },
    { name: '热门', href: '/hot', icon: TrendingUp },
    { name: '关注', href: '/following', icon: Users },
    { name: '通知', href: '/notifications', icon: Bell },
    { name: '消息', href: '/messages', icon: Mail },
    { name: '收藏', href: '/bookmarks', icon: Bookmark },
    { name: '个人主页', href: '/profile', icon: User },
    { name: '设置', href: '/settings', icon: Settings },
  ];

  const trendingTopics = [
    { name: '技术讨论', count: '1.2k' },
    { name: '生活分享', count: '856' },
    { name: '学习交流', count: '654' },
    { name: '职场经验', count: '432' },
  ];

  return (
    <div className="flex flex-col h-full px-4 py-6">
      {/* Logo */}
      <div className="mb-6 flex items-center">
        <Link to="/" className="flex items-center space-x-2">
          <img src="/logo192.png" alt="走线吧" className="h-8 w-8" />
          <span className="text-2xl font-bold text-white hidden md:inline">走线吧</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center space-x-4 px-4 py-3 rounded-full transition-colors',
                    isActive
                      ? 'font-bold text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-lg">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="mt-6 text-sm text-muted-foreground">
        <div className="flex flex-wrap gap-2">
          <Link to="/about" className="hover:underline">
            关于我们
          </Link>
          <Link to="/privacy" className="hover:underline">
            隐私政策
          </Link>
          <Link to="/terms" className="hover:underline">
            使用条款
          </Link>
        </div>
        <p className="mt-2">© 2024 走线吧</p>
      </div>
    </div>
  );
};

export default Sidebar;
