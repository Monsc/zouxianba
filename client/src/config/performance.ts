export const performanceConfig = {
  // 图片优化配置
  image: {
    // 图片质量 (0-100)
    quality: 80,
    // 图片格式
    formats: ['webp', 'avif'],
    // 图片尺寸
    sizes: {
      avatar: {
        sm: 40,
        md: 80,
        lg: 160,
      },
      post: {
        sm: 320,
        md: 640,
        lg: 1280,
      },
    },
    // 懒加载配置
    lazyLoad: {
      threshold: 0.1,
      rootMargin: '50px',
    },
  },

  // 缓存配置
  cache: {
    // API 缓存时间 (秒)
    api: {
      short: 60, // 1分钟
      medium: 300, // 5分钟
      long: 3600, // 1小时
    },
    // 静态资源缓存时间 (秒)
    static: {
      short: 3600, // 1小时
      medium: 86400, // 1天
      long: 604800, // 7天
    },
  },

  // 预加载配置
  preload: {
    // 预加载的关键资源
    critical: [
      '/fonts/main.woff2',
      '/images/logo.svg',
    ],
    // 预加载的页面
    pages: [
      '/feed',
      '/messages',
      '/notifications',
    ],
  },

  // 性能监控配置
  monitoring: {
    // 性能指标阈值
    metrics: {
      fcp: 2000, // First Contentful Paint (ms)
      lcp: 2500, // Largest Contentful Paint (ms)
      fid: 100, // First Input Delay (ms)
      cls: 0.1, // Cumulative Layout Shift
    },
    // 错误监控
    error: {
      sampleRate: 1.0, // 采样率
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'Network request failed',
      ],
    },
  },
}; 