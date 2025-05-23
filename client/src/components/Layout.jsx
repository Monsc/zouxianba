import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  Bell,
  Home,
  MessageSquare,
  Search,
  Settings,
  User,
  LogOut,
  TrendingUp,
  Users,
} from 'lucide-react';
import CreatePostButton from './CreatePostButton';

export const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isActive = path => location.pathname === path;

  const navItems = [
    { path: '/feed', icon: Home, label: '首页' },
    { path: '/notifications', icon: Bell, label: '通知' },
    { path: '/messages', icon: MessageSquare, label: '私信' },
    { path: `/profile/${user?.username || ''}`, icon: User, label: '个人主页' },
    { path: '/settings', icon: Settings, label: '设置' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 顶部栏 */}
      <header className="sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 h-16 shadow-sm">
        <Link to="/feed" className="text-2xl font-bold text-blue-500 flex items-center">
          <span className="mr-2">🐦</span> ZXB
        </Link>
        <div className="flex-1 flex items-center justify-center max-w-lg mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="搜索..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-muted focus:outline-none"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <CreatePostButton />
          {user ? (
            <Link to={`/profile/${user.username}`}>
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.username?.[0]}</AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Link to="/login">
              <Button size="sm" variant="outline">
                登录/注册
              </Button>
            </Link>
          )}
        </div>
      </header>

      <div className="flex-1 container mx-auto px-2 md:px-4 grid grid-cols-12 gap-4">
        {/* 左侧边栏 */}
        <aside className="hidden md:block col-span-3 lg:col-span-2 pt-6">
          <div className="sticky top-20 flex flex-col space-y-6">
            {/* 个人信息 */}
            {user && (
              <div className="flex flex-col items-center space-y-2 mb-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.username?.[0]}</AvatarFallback>
                </Avatar>
                <div className="font-bold text-lg">{user.username}</div>
                <div className="text-xs text-muted-foreground">{user.bio || '这个人很神秘~'}</div>
              </div>
            )}
            {/* 导航 */}
            <nav className="flex flex-col space-y-2">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive(item.path) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
              {user && (
                <Button variant="ghost" className="justify-start" onClick={logout}>
                  <LogOut className="w-5 h-5 mr-3" />
                  退出登录
                </Button>
              )}
            </nav>
            <div className="pt-4">
              <Button variant="outline" className="w-full" onClick={toggleTheme}>
                {theme === 'dark' ? '🌞 浅色' : '🌙 深色'}
              </Button>
            </div>
          </div>
        </aside>

        {/* 主内容区 */}
        <main className="col-span-12 md:col-span-6 lg:col-span-7 min-h-[80vh] pt-6">
          {children}
        </main>

        {/* 右侧边栏 */}
        <aside className="hidden lg:block col-span-3 pt-6">
          <div className="sticky top-20 space-y-6">
            <div className="bg-card rounded-lg p-4 shadow-sm mb-4">
              <div className="flex items-center mb-2">
                <Users className="w-5 h-5 mr-2 text-muted-foreground" />
                <span className="font-semibold">推荐关注</span>
              </div>
              {/* 推荐关注列表 */}
              <div className="space-y-2 text-sm text-muted-foreground">敬请期待</div>
            </div>
            <div className="bg-card rounded-lg p-4 shadow-sm">
              <div className="flex items-center mb-2">
                <TrendingUp className="w-5 h-5 mr-2 text-muted-foreground" />
                <span className="font-semibold">趋势话题</span>
              </div>
              {/* 趋势话题列表 */}
              <div className="space-y-2 text-sm text-muted-foreground">敬请期待</div>
            </div>
          </div>
        </aside>
      </div>

      {/* 移动端底部导航 */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex md:hidden justify-around items-center h-14 shadow-lg">
        {navItems.slice(0, 4).map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center px-2 py-1 ${
              isActive(item.path) ? 'text-blue-500' : 'text-muted-foreground hover:text-blue-400'
            }`}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
