import { getEnvConfig } from './envCheck';

/**
 * 启动检查工具
 * 用于在应用启动时进行必要的检查
 */
export const startupCheck = async () => {
  const checks = {
    environment: false,
    api: false,
    websocket: false,
    storage: false,
    performance: false,
  };

  try {
    // 1. 环境检查
    const envConfig = getEnvConfig();
    checks.environment = true;

    // 2. API 可用性检查
    try {
      const response = await fetch(`${envConfig.apiUrl}/health`);
      checks.api = response.ok;
    } catch (error) {
      console.error('API health check failed:', error);
    }

    // 3. WebSocket 连接检查 (socket.io)
    try {
      const { io } = await import('socket.io-client');
      const socket = io(envConfig.wsUrl, {
        transports: ['websocket'],
        timeout: 5000,
        reconnection: false,
      });
      await new Promise((resolve, reject) => {
        socket.on('connect', resolve);
        socket.on('connect_error', reject);
        setTimeout(reject, 5000); // 5秒超时
      });
      socket.close();
      checks.websocket = true;
    } catch (error) {
      console.error('WebSocket (socket.io) connection check failed:', error);
    }

    // 4. 存储可用性检查
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      checks.storage = true;
    } catch (error) {
      console.error('Storage check failed:', error);
    }

    // 5. 性能检查
    const performance = window.performance;
    if (performance && performance.timing) {
      const timing = performance.timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      checks.performance = loadTime < 3000; // 3秒内加载完成
    }

    // 输出检查结果
    console.table(checks);
    console.log('Startup check details:', checks);

    // 返回检查结果
    return {
      success: Object.values(checks).every(Boolean),
      checks,
    };
  } catch (error) {
    console.error('Startup check failed:', error);
    return {
      success: false,
      checks,
      error: error.message,
    };
  }
};

/**
 * 获取启动检查结果
 */
export const getStartupStatus = () => {
  const status = localStorage.getItem('startupStatus');
  return status ? JSON.parse(status) : null;
};

/**
 * 保存启动检查结果
 */
export const saveStartupStatus = status => {
  localStorage.setItem('startupStatus', JSON.stringify(status));
};

/**
 * 清除启动检查结果
 */
export const clearStartupStatus = () => {
  localStorage.removeItem('startupStatus');
};
