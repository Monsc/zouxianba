interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // 缓存时间（毫秒）
  maxSize?: number; // 最大缓存条目数
}

class Cache {
  private static instance: Cache;
  private cache: Map<string, CacheItem<any>>;
  private maxSize: number;
  private defaultTTL: number;

  private constructor(options: CacheOptions = {}) {
    this.cache = new Map();
    this.maxSize = options.maxSize || 1000;
    this.defaultTTL = options.ttl || 5 * 60 * 1000; // 默认 5 分钟
  }

  public static getInstance(options?: CacheOptions): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache(options);
    }
    return Cache.instance;
  }

  // 设置缓存
  public set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);

    // 如果缓存已满，删除最旧的条目
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.getOldestKey();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt,
    });
  }

  // 获取缓存
  public get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // 检查是否过期
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  // 删除缓存
  public delete(key: string): void {
    this.cache.delete(key);
  }

  // 清空缓存
  public clear(): void {
    this.cache.clear();
  }

  // 获取缓存大小
  public size(): number {
    return this.cache.size;
  }

  // 获取所有缓存键
  public keys(): string[] {
    return Array.from(this.cache.keys());
  }

  // 检查缓存是否存在
  public has(key: string): boolean {
    return this.cache.has(key);
  }

  // 获取最旧的缓存键
  private getOldestKey(): string | null {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  // 清理过期缓存
  public cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// 创建缓存实例
export const cache = Cache.getInstance({
  ttl: 5 * 60 * 1000, // 5 分钟
  maxSize: 1000, // 最多缓存 1000 条数据
});

// 定期清理过期缓存
setInterval(() => {
  cache.cleanup();
}, 60 * 1000); // 每分钟清理一次

// 缓存装饰器
export function cached(ttl?: number) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const key = `${propertyKey}:${JSON.stringify(args)}`;
      const cachedData = cache.get(key);

      if (cachedData) {
        return cachedData;
      }

      const result = await originalMethod.apply(this, args);
      cache.set(key, result, ttl);
      return result;
    };

    return descriptor;
  };
}

// 使用示例：
/*
class UserService {
  @cached(5 * 60 * 1000) // 缓存 5 分钟
  async getUserProfile(userId: string) {
    // 获取用户资料的逻辑
  }
}
*/ 