import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import RightSidebar from '../RightSidebar';
import MobileNav from '../MobileNav';
import CreatePostButton from '../CreatePostButton';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background flex">
      {/* 左侧栏 - 固定宽度 */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-64 border-r border-border bg-background z-30">
        <Sidebar iconOnly={false} />
      </aside>

      {/* 主内容区 - 居中且不被侧栏遮挡 */}
      <div className="flex-1 flex justify-center">
        <main className="w-full max-w-2xl min-h-screen px-4 md:ml-64 xl:mr-80 border-x border-border bg-background relative z-10">
          {children}
        </main>
        {/* 桌面端右下角悬浮发帖按钮 */}
        <CreatePostButton />
      </div>

      {/* 右侧栏 - 固定宽度，避免重叠 */}
      <aside className="hidden xl:flex flex-col fixed top-0 right-0 h-screen w-80 border-l border-border bg-white dark:bg-[#192734] z-20">
        <RightSidebar />
      </aside>

      {/* 移动端底部导航 - 推特风格 */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex md:hidden justify-around items-center h-14 shadow-lg">
        <MobileNav />
      </nav>
    </div>
  );
};

export default MainLayout;
