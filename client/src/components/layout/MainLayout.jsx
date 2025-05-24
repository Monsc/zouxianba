import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import RightSidebar from '../RightSidebar';
import MobileNav from '../MobileNav';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background flex">
      {/* 左侧栏 - 固定宽度，md及以上显示 */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-64 border-r border-border bg-background z-30">
        <Sidebar iconOnly={false} />
      </aside>

      {/* 主内容区 - 居中且不被侧栏遮挡，移动端100%宽 */}
      <div className="flex-1 flex justify-center">
        <main className="w-full max-w-2xl min-h-screen px-0 md:px-4 md:ml-64 xl:mr-80 border-x border-border bg-background relative z-10 transition-all duration-200">
          {children}
        </main>
      </div>

      {/* 右侧栏 - 固定宽度，xl及以上显示 */}
      <aside className="hidden xl:flex flex-col fixed top-0 right-0 h-screen w-80 border-l border-border bg-white dark:bg-[#192734] z-20">
        <RightSidebar />
      </aside>

      {/* 移动端底部导航和悬浮发帖按钮（推特风格） */}
      <MobileNav />
    </div>
  );
};

export default MainLayout;
