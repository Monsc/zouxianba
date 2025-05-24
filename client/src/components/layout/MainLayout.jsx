import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import RightSidebar from '../RightSidebar';
import MobileNav from '../MobileNav';

const MainLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* 左侧栏 */}
      <aside className="hidden md:flex flex-col w-64 p-4 border-r border-gray-200 dark:border-gray-800">
        <Sidebar />
      </aside>
      {/* 主内容 */}
      <main className="flex-1 max-w-2xl mx-auto w-full p-4">{children}</main>
      {/* 右侧栏 */}
      <aside className="hidden xl:block w-80 p-4 border-l border-gray-200 dark:border-gray-800">
        <RightSidebar />
      </aside>
      {/* 移动端发帖按钮 */}
      <button className="fixed bottom-4 right-4 md:hidden btn btn-primary rounded-full shadow-lg z-50">
        +
      </button>
      <MobileNav />
    </div>
  );
};

export default MainLayout;
