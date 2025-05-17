// public/sw.js
const CACHE_NAME = 'zouxianba-cache-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const SYNC_TAG = 'zouxianba-sync';

// 静态资源缓存
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/assets/index.css',
  '/assets/index.js'
];

// 安装Service Worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    Promise.all([
      // 缓存静态资源
      caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS)),
      // 预缓存主页面
      caches.open(CACHE_NAME).then(cache => cache.addAll(['/']))
    ])
  );
});

// 激活Service Worker
self.addEventListener('activate', function(event) {
  event.waitUntil(
    Promise.all([
      // 清理旧缓存
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // 立即接管所有客户端
      clients.claim(),
      // 注册定期同步
      self.registration.periodicSync.register(SYNC_TAG, {
        minInterval: 24 * 60 * 60 * 1000 // 24小时
      })
    ])
  );
});

// 处理网络请求
self.addEventListener('fetch', function(event) {
  // 只处理GET请求
  if (event.request.method !== 'GET') return;

  // 对于API请求,使用网络优先策略
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // 缓存API响应
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // 如果网络请求失败,尝试从缓存获取
          return caches.match(event.request);
        })
    );
    return;
  }

  // 对于静态资源,使用缓存优先策略
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then(function(response) {
            // 缓存新的响应
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(event.request, responseClone);
            });
            return response;
          });
      })
  );
});

// 处理后台同步
self.addEventListener('sync', function(event) {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(syncData());
  }
});

// 处理定期同步
self.addEventListener('periodicsync', function(event) {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(syncData());
  }
});

// 同步数据
async function syncData() {
  try {
    // 获取所有客户端
    const clients = await self.clients.matchAll();
    
    // 向每个客户端发送同步消息
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_DATA',
        timestamp: new Date().toISOString()
      });
    });
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// 处理推送通知
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url
      },
      actions: [
        {
          action: 'open',
          title: '查看'
        },
        {
          action: 'close',
          title: '关闭'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// 处理通知点击
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.action === 'open' && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// 处理共享目标
self.addEventListener('share', function(event) {
  if (event.data) {
    event.waitUntil(
      clients.matchAll().then(clients => {
        // 向所有客户端广播共享数据
        clients.forEach(client => {
          client.postMessage({
            type: 'SHARE_DATA',
            data: event.data
          });
        });
      })
    );
  }
}); 