import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Bell, Home, MessageSquare, Search, Settings, User, LogOut } from 'lucide-react';
import CreatePostButton from './CreatePostButton';

export const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/feed', icon: Home, label: '首页' },
    { path: '/notifications', icon: Bell, label: '通知' },
    { path: '/messages', icon: MessageSquare, label: '私信' },
    { path: `/profile/${user?.username}`, icon: User, label: '个人主页' },
    { path: '/settings', icon: Settings, label: '设置' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-12 gap-4">
          {/* 左侧导航栏 */}
          <div className="col-span-3 lg:col-span-2">
            <div className="sticky top-4">
              <div className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
                {user && (
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={logout}
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    退出登录
                  </Button>
                )}
                <CreatePostButton />
              </div>
            </div>
          </div>

          {/* 主内容区 */}
          <main className="col-span-9 lg:col-span-7">
            {children}
          </main>

          {/* 右侧边栏 */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-4">
              <div className="bg-card rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-4 mb-4">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="搜索..."
                    className="w-full bg-transparent border-none focus:outline-none"
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold">推荐关注</h3>
                  {/* 推荐关注列表 */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
