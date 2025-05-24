import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

class MonitoringService {
  constructor() {
    this.initializeSentry();
    this.performanceMetrics = new Map();
  }

  initializeSentry() {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [new BrowserTracing()],
      tracesSampleRate: 1.0,
      environment: import.meta.env.MODE,
      beforeSend(event) {
        // 过滤掉敏感信息
        if (event.request?.cookies) {
          delete event.request.cookies;
        }
        return event;
      }
    });
  }

  trackPerformance(metricName, value) {
    this.performanceMetrics.set(metricName, value);
    this.reportMetric(metricName, value);
  }

  reportMetric(metricName, value) {
    // 发送到性能监控服务
    fetch('/api/metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: metricName,
        value,
        timestamp: new Date().toISOString()
      })
    }).catch(error => {
      console.error('Failed to report metric:', error);
    });
  }

  trackUserAction(action, data = {}) {
    Sentry.addBreadcrumb({
      category: 'user-action',
      message: action,
      data,
      level: 'info'
    });
  }

  trackError(error, context = {}) {
    Sentry.withScope(scope => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
      Sentry.captureException(error);
    });
  }

  trackNavigation(path) {
    Sentry.addBreadcrumb({
      category: 'navigation',
      message: `Navigated to ${path}`,
      level: 'info'
    });
  }

  trackApiCall(endpoint, method, duration, status) {
    this.trackPerformance(`api.${method.toLowerCase()}.${endpoint}`, duration);
    
    if (status >= 400) {
      Sentry.addBreadcrumb({
        category: 'api',
        message: `${method} ${endpoint} failed with status ${status}`,
        data: { duration, status },
        level: 'error'
      });
    }
  }

  trackComponentRender(componentName, duration) {
    this.trackPerformance(`component.${componentName}.render`, duration);
  }

  trackImageLoad(imageUrl, duration) {
    this.trackPerformance(`image.${imageUrl}.load`, duration);
  }

  getPerformanceMetrics() {
    return Object.fromEntries(this.performanceMetrics);
  }

  clearPerformanceMetrics() {
    this.performanceMetrics.clear();
  }
}

const monitoringService = new MonitoringService();
export default monitoringService; 