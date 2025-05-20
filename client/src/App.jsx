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
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Home />} />
              <Route path="profile/:userId" element={<Profile />} />
              <Route path="post/:postId" element={<Post />} />
              <Route path="settings" element={<Settings />} />
              <Route path="settings/security" element={<SecuritySettings />} />
              <Route path="post/:postId" element={<PostDetail />} />
              <Route path="discover" element={<Discover />} />
              <Route path="messages" element={<Messages />} />
              <Route path="messages/:userId" element={<Chat />} />
              <Route path="topic/:tag" element={<TopicPage />} />
              <Route path="mentions" element={<Mentions />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
