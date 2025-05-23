// 缓存配置
const CACHE_CONFIG = {
  // 缓存过期时间（毫秒）
  EXPIRATION_TIME: 5 * 60 * 1000, // 5分钟
  // 最大缓存项数
  MAX_ITEMS: 100,
  // 清理间隔（毫秒）
  CLEANUP_INTERVAL: 60 * 1000, // 1分钟
};

class CacheService {
  constructor() {
    this.cache = new Map();
    this.setupCleanup();
  }

  // 设置缓存项
  set(key, value, expirationTime = CACHE_CONFIG.EXPIRATION_TIME) {
    if (this.cache.size >= CACHE_CONFIG.MAX_ITEMS) {
      // 如果缓存已满，删除最旧的项
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    const item = {
      value,
      timestamp: Date.now(),
      expirationTime,
    };

    this.cache.set(key, item);
  }

  // 获取缓存项
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    // 检查是否过期
    if (Date.now() - item.timestamp > item.expirationTime) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  // 删除缓存项
  delete(key) {
    this.cache.delete(key);
  }

  // 清空缓存
  clear() {
    this.cache.clear();
  }

  // 获取缓存统计信息
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  // 设置定期清理
  setupCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, item] of this.cache.entries()) {
        if (now - item.timestamp > item.expirationTime) {
          this.cache.delete(key);
        }
      }
    }, CACHE_CONFIG.CLEANUP_INTERVAL);
  }
}

// 创建缓存服务实例
const cacheService = new CacheService();

// 缓存装饰器
export function withCache(expirationTime = CACHE_CONFIG.EXPIRATION_TIME) {
  return function (target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args) {
      const cacheKey = `${propertyKey}:${JSON.stringify(args)}`;
      const cachedValue = cacheService.get(cacheKey);

      if (cachedValue) {
        return cachedValue;
      }

      const result = await originalMethod.apply(this, args);
      cacheService.set(cacheKey, result, expirationTime);
      return result;
    };

    return descriptor;
  };
}

// 预加载数据
export async function preloadData(key, promise, expirationTime = CACHE_CONFIG.EXPIRATION_TIME) {
  try {
    const data = await promise;
    cacheService.set(key, data, expirationTime);
    return data;
  } catch (error) {
    console.error('Failed to preload data:', error);
    return null;
  }
}

export default cacheService;
