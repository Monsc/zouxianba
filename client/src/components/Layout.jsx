import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import MobileNav from './MobileNav';
import NotificationCenter from './NotificationCenter';
import KeyboardHandler from './KeyboardHandler';
import '../styles/global.css';

const Layout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // 检测设备类型
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 键盘导航处理
  const handleKeyboardNavigation = (event) => {
    // 数字键导航
    if (event.key >= '1' && event.key <= '9') {
      const routes = {
        '1': '/',
        '2': '/explore',
        '3': '/notifications',
        '4': '/messages',
        '5': '/profile',
      };
      const route = routes[event.key];
      if (route) {
        navigate(route);
      }
    }

    // 快捷键
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'n':
          event.preventDefault();
          navigate('/new-post');
          break;
        case 's':
          event.preventDefault();
          navigate('/search');
          break;
        case 'h':
          event.preventDefault();
          navigate('/');
          break;
        default:
          break;
      }
    }
  };

  // 触摸手势处理
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;

    const handleTouchMove = (e) => {
      const touch = e.touches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;

      // 水平滑动超过阈值时触发导航
      if (Math.abs(deltaX) > 100 && Math.abs(deltaY) < 50) {
        if (deltaX > 0) {
          // 向右滑动，返回上一页
          navigate(-1);
        } else {
          // 向左滑动，前进
          navigate(1);
        }
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      }
    };

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  return (
    <KeyboardHandler
      onEscape={() => setShowNotifications(false)}
      onKeyDown={handleKeyboardNavigation}
    >
      <div
        className="min-h-screen bg-gray-50 dark:bg-gray-900"
        onTouchStart={handleTouchStart}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row">
            {/* 侧边栏 - 桌面端 */}
            {!isMobile && (
              <motion.aside
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-64 fixed h-screen py-6"
              >
                <nav className="space-y-2">
                  {/* 导航项 */}
                </nav>
              </motion.aside>
            )}

            {/* 主内容区 */}
            <main
              className={`flex-1 ${
                !isMobile ? 'lg:ml-64' : ''
              } transition-all duration-300`}
            >
              <div className="py-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {children}
                  </motion.div>
                </AnimatePresence>
              </div>
            </main>

            {/* 通知中心 */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  className="fixed right-0 top-0 h-screen w-80 bg-white dark:bg-gray-800 shadow-lg z-50"
                >
                  <NotificationCenter />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 移动端底部导航 */}
        {isMobile && <MobileNav />}
      </div>
    </KeyboardHandler>
  );
};

export default Layout;
