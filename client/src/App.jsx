import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Post from './pages/Post';
import NotFound from './pages/NotFound';
import Settings from './pages/Settings';
import PostDetail from './pages/PostDetail';
import Discover from './pages/Discover';
import Messages from './pages/Messages';
import Chat from './pages/Chat';
import TopicPage from './pages/HashtagPage';
import Mentions from './pages/Mentions';
import SecuritySettings from './pages/SecuritySettings';
import './styles/global.css';
import { getUnreadNotificationCount } from './services/api';
import { Toaster } from './components/ui/toaster';
import { ToastProvider } from './contexts/ToastContext';
import AdminLayout from './components/layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Posts from './pages/admin/Posts';
import Comments from './pages/admin/Comments';
import EmailTemplates from './pages/admin/EmailTemplates';
import Analytics from './pages/admin/Analytics';
import ReportDetail from './pages/admin/ReportDetail';
import SystemLogs from './pages/admin/SystemLogs';
import { useAuth } from './hooks/useAuth';
import { Feed } from './pages/Feed';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const data = await getUnreadNotificationCount();
        setUnreadCount(data.count || 0);
      } catch (error) {
        console.error('Failed to fetch unread notifications:', error);
      }
    };

    fetchUnread();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* 默认重定向到信息流 */}
            <Route path="/" element={<Navigate to="/feed" replace />} />
            
            {/* 公共路由 */}
            <Route path="/feed" element={<Layout><Feed /></Layout>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* 需要认证的路由 */}
            <Route path="/profile/:username" element={<Layout><Profile /></Layout>} />
            <Route path="/settings" element={<Layout><Settings /></Layout>} />
            
            {/* 管理面板路由 */}
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <Dashboard />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedAdminRoute>
                  <Dashboard />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedAdminRoute>
                  <Users />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/posts"
              element={
                <ProtectedAdminRoute>
                  <Posts />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/posts/:id"
              element={
                <ProtectedAdminRoute>
                  <PostDetail />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/comments"
              element={
                <ProtectedAdminRoute>
                  <Comments />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedAdminRoute>
                  <Settings />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/email-templates"
              element={
                <ProtectedAdminRoute>
                  <EmailTemplates />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedAdminRoute>
                  <Analytics />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/reports/:id"
              element={
                <ProtectedAdminRoute>
                  <ReportDetail />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/logs"
              element={
                <ProtectedAdminRoute>
                  <SystemLogs />
                </ProtectedAdminRoute>
              }
            />
            
            {/* 404 页面 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

// 受保护的管理路由组件
const ProtectedAdminRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

export default App;
