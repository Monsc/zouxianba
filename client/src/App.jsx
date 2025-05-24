import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/Layout';
import { AdminLayout } from './components/layouts/AdminLayout';
import Toaster from './components/ui/toaster';
import LoadingSpinner from './components/LoadingSpinner';
import { notificationService } from './services/notification';
import ErrorBoundary from './components/common/ErrorBoundary';
import PerformanceMonitor from './components/common/PerformanceMonitor';
import PWARegister from './components/common/PWARegister';
import { checkEnvVariables, getEnvConfig } from './utils/envCheck';
import { startupCheck, getStartupStatus, saveStartupStatus } from './utils/startupCheck';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Feed from './pages/Feed';
import Notifications from './pages/notifications/index';
import Messages from './pages/Messages';
import Search from './pages/Search';
import { AnimatePresence, motion } from 'framer-motion';
import MainLayout from './components/layout/MainLayout';
import BottomNav from './components/layout/BottomNav';
import Navbar from './components/layout/Navbar';

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

// 页面切换动画包装
const AnimatedPage = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -24 }}
    transition={{ duration: 0.32, ease: 'easeInOut' }}
    className="min-h-screen"
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/feed" replace />} />
        <Route path="/feed" element={<AnimatedPage><MainLayout><Feed /></MainLayout></AnimatedPage>} />
        <Route path="/notifications" element={<AnimatedPage><MainLayout><Notifications /></MainLayout></AnimatedPage>} />
        <Route path="/messages" element={<AnimatedPage><MainLayout><Messages /></MainLayout></AnimatedPage>} />
        <Route path="/login" element={<AnimatedPage><MainLayout><Login /></MainLayout></AnimatedPage>} />
        <Route path="/register" element={<AnimatedPage><MainLayout><Register /></MainLayout></AnimatedPage>} />
        <Route path="/profile/:username" element={<AnimatedPage><MainLayout><Profile /></MainLayout></AnimatedPage>} />
        <Route path="/settings" element={<AnimatedPage><MainLayout><Settings /></MainLayout></AnimatedPage>} />
        <Route path="*" element={<AnimatedPage><MainLayout><NotFound /></MainLayout></AnimatedPage>} />
      </Routes>
    </AnimatePresence>
  );
};

export const App = () => {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <Router>
          <AuthProvider>
            <ToastProvider>
              <Suspense fallback={<LoadingSpinner />}>
                <AnimatedRoutes />
              </Suspense>
            </ToastProvider>
          </AuthProvider>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
