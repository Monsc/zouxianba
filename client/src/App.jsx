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
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Feed from './components/Feed';

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
  return (
    <ThemeProvider>
      <div>home</div>
    </ThemeProvider>
  );
};

export default App;
