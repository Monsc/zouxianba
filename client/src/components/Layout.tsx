import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import CreatePostButton from './CreatePostButton';
import '../styles/global.css';

function Layout() {
  return (
    <div className="app-container flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1 w-full max-w-7xl mx-auto">
        {/* 左侧导航栏（桌面端显示） */}
        <aside className="sidebar-left hidden lg:flex flex-col w-64 p-4 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-[#192734]">
          {/* 可放置Logo、主导航、个人信息等 */}
          <div className="font-bold text-xl mb-6 text-primary">ZouXianBa</div>
          {/* 可扩展更多导航项 */}
        </aside>
        {/* 中间内容区 */}
        <main className="main-content flex-1 min-w-0 px-2 sm:px-4 md:px-8 py-4">
          <Outlet />
        </main>
        {/* 右侧推荐栏（桌面端显示） */}
        <aside className="sidebar-right hidden xl:flex flex-col w-80 p-4 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-[#192734]">
          {/* 可放置推荐用户、热门话题等 */}
          <div className="font-bold text-lg mb-4 text-primary">推荐</div>
          <div className="text-sm text-gray-500">更多内容即将上线…</div>
        </aside>
      </div>
      {/* 移动端底部导航栏和发帖按钮 */}
      <BottomNav />
      <CreatePostButton />
    </div>
  );
}

export default Layout; 