import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';

// 性能监控中间件
export const performanceMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = performance.now();

  // 请求完成后的回调
  res.on('finish', () => {
    const duration = performance.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;

    // 记录请求性能
    console.log({
      type: 'request',
      method,
      url: originalUrl,
      status: statusCode,
      duration: `${duration.toFixed(2)}ms`,
      timestamp: new Date().toISOString(),
    });

    // 如果响应时间过长，记录警告
    if (duration > 1000) {
      console.warn({
        type: 'slow_request',
        method,
        url: originalUrl,
        duration: `${duration.toFixed(2)}ms`,
        timestamp: new Date().toISOString(),
      });
    }
  });

  next();
};

// 内存使用监控
export const memoryMonitor = () => {
  const used = process.memoryUsage();
  console.log({
    type: 'memory_usage',
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
    rss: `${Math.round(used.rss / 1024 / 1024)}MB`,
    timestamp: new Date().toISOString(),
  });
};

// 定期监控内存使用
setInterval(memoryMonitor, 60000); // 每分钟监控一次 