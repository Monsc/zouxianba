import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Mail,
  Settings,
  FileText,
  MessageSquare,
  Shield,
  BarChart,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  {
    title: '仪表盘',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: '用户管理',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: '内容管理',
    href: '/admin/posts',
    icon: FileText,
  },
  {
    title: '评论管理',
    href: '/admin/comments',
    icon: MessageSquare,
  },
  {
    title: '邮件模板',
    href: '/admin/email-templates',
    icon: Mail,
  },
  {
    title: '安全设置',
    href: '/admin/security',
    icon: Shield,
  },
  {
    title: '数据分析',
    href: '/admin/analytics',
    icon: BarChart,
  },
  {
    title: '系统设置',
    href: '/admin/settings',
    icon: Settings,
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 顶部导航栏 */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/admin" className="text-xl font-bold text-gray-800">
                  走线吧管理后台
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-500">管理员</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* 侧边栏 */}
        <aside className="w-64 bg-white border-r min-h-screen">
          <nav className="mt-5 px-2">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'mr-3 h-5 w-5',
                        isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                      )}
                    />
                    {item.title}
                  </Link>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
} 