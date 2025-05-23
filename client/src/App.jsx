import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/Layout';
import { AdminLayout } from './components/layouts/AdminLayout';
import Toaster from './components/ui/toaster';
import { LoadingSpinner } from './components/LoadingSpinner';
import { notificationService } from './services/notification';
import ErrorBoundary from './components/common/ErrorBoundary';
import PerformanceMonitor from './components/common/PerformanceMonitor';
import PWARegister from './components/common/PWARegister';
import { checkEnvVariables, getEnvConfig } from './utils/envCheck';
import { startupCheck, getStartupStatus, saveStartupStatus } from './utils/startupCheck';

// 懒加载页面组件
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Feed = lazy(() => import('./components/Feed'));

// 懒加载管理页面组件
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Users = lazy(() => import('./pages/admin/Users'));
const Posts = lazy(() => import('./pages/admin/Posts'));
const Comments = lazy(() => import('./pages/admin/Comments'));
const EmailTemplates = lazy(() => import('./pages/admin/EmailTemplates'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const ReportDetail = lazy(() => import('./pages/admin/ReportDetail'));
const SystemLogs = lazy(() => import('./pages/admin/SystemLogs'));

// 样式
import './styles/global.css';

// 受保护的管理路由组件
const ProtectedAdminRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

// 页面过渡组件
const PageTransition = ({ children }) => {
  return (
    <div className="animate-fade-in">
      {children}
    </div>
  );
};

export const App = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isEnvValid, setIsEnvValid] = useState(true);
  const [isStartupValid, setIsStartupValid] = useState(true);
  const [startupError, setStartupError] = useState(null);

  useEffect(() => {
    console.log('App useEffect running');
    const initializeApp = async () => {
      try {
        // 检查环境变量
        const envValid = checkEnvVariables();
        setIsEnvValid(envValid);

        if (!envValid) {
          console.error('Environment check failed. Please check your .env file.');
          return;
        }

        // 检查启动状态
        const cachedStatus = getStartupStatus();
        if (cachedStatus && cachedStatus.success) {
          setIsStartupValid(true);
        } else {
          const status = await startupCheck();
          setIsStartupValid(status.success);
          setStartupError(status.error);
          saveStartupStatus(status);
        }

        // 获取未读通知
        try {
          const data = await notificationService.getUnreadCount();
          setUnreadCount(data.count || 0);
        } catch (error) {
          console.error('Failed to fetch unread notifications:', error);
        }
      } catch (e) {
        console.error('App 初始化异常:', e, e?.message, e?.stack);
        throw e;
      }
    };
    initializeApp();
  }, []);

  if (!isEnvValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            环境配置错误
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            请检查环境变量配置是否正确。
          </p>
        </div>
      </div>
    );
  }

  if (!isStartupValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            启动检查失败
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {startupError || '应用启动检查失败，请刷新页面重试。'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Router>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  {/* 默认重定向到信息流 */}
                  <Route path="/" element={<Navigate to="/feed" replace />} />
                  
                  {/* 公共路由 */}
                  <Route 
                    path="/feed" 
                    element={
                      <PageTransition>
                        <Layout><Feed /></Layout>
                      </PageTransition>
                    } 
                  />
                  <Route 
                    path="/login" 
                    element={
                      <PageTransition>
                        <Login />
                      </PageTransition>
                    } 
                  />
                  <Route 
                    path="/register" 
                    element={
                      <PageTransition>
                        <Register />
                      </PageTransition>
                    } 
                  />
                  
                  {/* 需要认证的路由 */}
                  <Route 
                    path="/profile/:username" 
                    element={
                      <PageTransition>
                        <Layout><Profile /></Layout>
                      </PageTransition>
                    } 
                  />
                  <Route 
                    path="/settings" 
                    element={
                      <PageTransition>
                        <Layout><Settings /></Layout>
                      </PageTransition>
                    } 
                  />
                  
                  {/* 管理面板路由 */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedAdminRoute>
                        <PageTransition>
                          <Dashboard />
                        </PageTransition>
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedAdminRoute>
                        <PageTransition>
                          <Dashboard />
                        </PageTransition>
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <ProtectedAdminRoute>
                        <PageTransition>
                          <Users />
                        </PageTransition>
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/admin/posts"
                    element={
                      <ProtectedAdminRoute>
                        <PageTransition>
                          <Posts />
                        </PageTransition>
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/admin/comments"
                    element={
                      <ProtectedAdminRoute>
                        <PageTransition>
                          <Comments />
                        </PageTransition>
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/admin/settings"
                    element={
                      <ProtectedAdminRoute>
                        <PageTransition>
                          <Settings />
                        </PageTransition>
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/admin/email-templates"
                    element={
                      <ProtectedAdminRoute>
                        <PageTransition>
                          <EmailTemplates />
                        </PageTransition>
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/admin/analytics"
                    element={
                      <ProtectedAdminRoute>
                        <PageTransition>
                          <Analytics />
                        </PageTransition>
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/admin/reports/:id"
                    element={
                      <ProtectedAdminRoute>
                        <PageTransition>
                          <ReportDetail />
                        </PageTransition>
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/admin/logs"
                    element={
                      <ProtectedAdminRoute>
                        <PageTransition>
                          <SystemLogs />
                        </PageTransition>
                      </ProtectedAdminRoute>
                    }
                  />
                  
                  {/* 404 页面 */}
                  <Route 
                    path="*" 
                    element={
                      <PageTransition>
                        <NotFound />
                      </PageTransition>
                    } 
                  />
                </Routes>
              </Suspense>
              <Toaster />
              <PerformanceMonitor />
              <PWARegister />
            </Router>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
