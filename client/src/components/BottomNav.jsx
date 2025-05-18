import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUnreadNotificationCount, getUnreadMessageCount } from '../services/api';

const BottomNav = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const data = await getUnreadNotificationCount();
        setUnreadCount(data.count || 0);
      } catch (error) {
        console.error('Failed to fetch unread notifications:', error);
      }
    };

    const fetchUnreadMsg = async () => {
      try {
        const data = await getUnreadMessageCount();
        setUnreadMsgCount(data || 0); // 直接使用返回的数字
      } catch (error) {
        console.error('Failed to fetch unread messages:', error);
      }
    };

    fetchUnread();
    fetchUnreadMsg();

    // You might want to set up a mechanism to refetch these counts periodically or based on events
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
      <ul className="flex justify-around h-14 items-center">
        <li>
          <Link
            to="/"
            className="flex flex-col items-center justify-center text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors duration-200"
          >
            <span className="text-xs">首页</span>
          </Link>
        </li>
        <li>
          <Link
            to="/discover"
            className="flex flex-col items-center justify-center text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors duration-200"
          >
            <span className="text-xs">发现</span>
          </Link>
        </li>
        <li className="relative">
          <Link
            to="/notifications"
            className="flex flex-col items-center justify-center text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors duration-200"
          >
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                {unreadCount}
              </span>
            )}
            <span className="text-xs">通知</span>
          </Link>
        </li>
        <li className="relative">
          <Link
            to="/messages"
            className="flex flex-col items-center justify-center text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors duration-200"
          >
            {unreadMsgCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                {unreadMsgCount}
              </span>
            )}
            <span className="text-xs">私信</span>
          </Link>
        </li>
        <li>
          <Link
            to="/create-post"
            className="flex flex-col items-center justify-center text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors duration-200"
          >
            <span className="text-xs">发布</span>
          </Link>
        </li>
        <li>
          <Link
            to="/profile/me"
            className="flex flex-col items-center justify-center text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors duration-200"
          >
            <span className="text-xs">我的</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default BottomNav;
