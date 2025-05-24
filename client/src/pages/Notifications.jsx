import React from 'react';
import { NotificationList } from '../components/NotificationList';
import { Bell } from 'lucide-react';

export default function Notifications() {
  return (
    <div className="max-w-2xl mx-auto">
      {/* 页面标题 */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center px-4 py-3">
          <Bell className="w-6 h-6 text-gray-900 dark:text-white" />
          <h1 className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
            通知
          </h1>
        </div>
      </div>

      {/* 通知列表 */}
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        <NotificationList />
      </div>
    </div>
  );
} 