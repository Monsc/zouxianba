'use client';

import React, { useEffect } from 'react';
import { performanceConfig } from '@/config/performance';

export const PerformanceMonitor = () => {
  useEffect(() => {
    // 监控 First Contentful Paint (FCP)
    const fcpObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      if (entries.length > 0) {
        const fcp = entries[0].startTime;
        reportMetric('fcp', fcp);
      }
    });
    fcpObserver.observe({ entryTypes: ['paint'] });

    // 监控 Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      if (entries.length > 0) {
        const lcp = entries[entries.length - 1].startTime;
        reportMetric('lcp', lcp);
      }
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // 监控 First Input Delay (FID)
    const fidObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      if (entries.length > 0) {
        const fid = entries[0].processingStart - entries[0].startTime;
        reportMetric('fid', fid);
      }
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // 监控 Cumulative Layout Shift (CLS)
    const clsObserver = new PerformanceObserver(list => {
      let cls = 0;
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          cls += entry.value;
        }
      }
      reportMetric('cls', cls);
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });

    // 监控错误
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      fcpObserver.disconnect();
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // 报告性能指标
  const reportMetric = (name, value) => {
    const threshold = performanceConfig.monitoring.metrics[name];
    if (value > threshold) {
      console.warn(`Performance warning: ${name} is ${value}ms (threshold: ${threshold}ms)`);
      // 这里可以添加性能指标上报逻辑
    }
  };

  // 处理 JavaScript 错误
  const handleError = event => {
    if (shouldIgnoreError(event.message)) return;
    console.error('JavaScript error:', event);
    // 这里可以添加错误上报逻辑
  };

  // 处理未处理的 Promise 拒绝
  const handleUnhandledRejection = event => {
    if (shouldIgnoreError(event.reason?.message)) return;
    console.error('Unhandled promise rejection:', event);
    // 这里可以添加错误上报逻辑
  };

  // 检查是否应该忽略错误
  const shouldIgnoreError = message => {
    return performanceConfig.monitoring.error.ignoreErrors.some(
      pattern => message && message.includes(pattern)
    );
  };

  return null; // 这是一个无UI组件
};
