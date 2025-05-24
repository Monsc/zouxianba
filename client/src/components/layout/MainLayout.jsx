import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import RightSidebar from '../RightSidebar';
import MobileNav from '../MobileNav';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';

const MainLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-background">
      {/* 左侧栏 - 响应式宽度，icon-only 导航在小屏 */}
      <aside className="hidden sm:flex flex-col fixed top-0 left-0 h-screen w-20 md:w-64 border-r border-border bg-background z-30">
        <Sidebar iconOnly />
      </aside>

      {/* 主内容区域 - 居中，最大宽度限制，响应式边距 */}
      <div className="flex-1 sm:ml-20 md:ml-64">
        <main className="max-w-2xl mx-auto min-h-screen px-0 md:px-4 border-x border-border">
          {children}
        </main>
      </div>

      {/* 右侧栏 - 仅大屏显示 */}
      <aside className="hidden xl:block fixed top-0 right-0 h-screen w-80 border-l border-border bg-white dark:bg-[#192734] z-20">
        <RightSidebar />
      </aside>

      {/* 移动端发帖按钮 - 浮动右下角，推特风格 */}
      <Button
        size="icon"
        className="fixed bottom-20 right-6 sm:right-8 md:hidden rounded-full shadow-lg z-50 h-14 w-14 bg-primary text-white hover:bg-primary-hover"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* 移动端底部导航 - 推特风格 */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex sm:hidden justify-around items-center h-14 shadow-lg">
        <MobileNav />
      </nav>
    </div>
  );
};

export default MainLayout;
