import React, { useEffect } from 'react';
import { useUserStore } from '../../store';

const PerformanceMonitor = () => {
  const user = useUserStore(state => state.user);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // 监控页面加载性能
      const reportWebVitals = async () => {
        const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');

        getCLS(console.log); // Cumulative Layout Shift
        getFID(console.log); // First Input Delay
        getFCP(console.log); // First Contentful Paint
        getLCP(console.log); // Largest Contentful Paint
        getTTFB(console.log); // Time to First Byte
      };

      reportWebVitals();

      // 监控内存使用
      if (window.performance && window.performance.memory) {
        setInterval(() => {
          const memory = window.performance.memory;
          console.log('Memory Usage:', {
            usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
            totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
            jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB',
          });
        }, 5000);
      }

      // 监控长任务
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              // 超过50ms的任务
              console.warn('Long task detected:', entry);
            }
          }
        });

        observer.observe({ entryTypes: ['longtask'] });
      }
    }
  }, []);

  // 在生产环境中不渲染任何内容
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-lg text-xs opacity-50 hover:opacity-100 transition-opacity">
      <div>Performance Monitor</div>
      <div>User: {user?.username || 'Guest'}</div>
    </div>
  );
};

export default PerformanceMonitor;
