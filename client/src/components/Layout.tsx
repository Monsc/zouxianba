import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import BottomNav from './BottomNav';
import CreatePostButton from './CreatePostButton';
import '../styles/global.css';

function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#15202B]">
      <Header />
      <div className="container mx-auto px-4 pt-16">
        <div className="flex">
          {/* 左侧边栏 */}
          <Sidebar />
          
          {/* 主内容区 */}
          <main className="flex-1 max-w-2xl mx-auto px-4">
            <Outlet />
          </main>
          
          {/* 右侧边栏 */}
          <RightSidebar />
        </div>
      </div>
      
      {/* 移动端底部导航 */}
      <BottomNav />
      
      {/* 移动端发帖按钮 */}
      <CreatePostButton />
    </div>
  );
}

export default Layout; 