import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { getToken, setToken, removeToken } from '../utils/auth';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 刷新 token
  const refreshToken = async () => {
    try {
      setRefreshing(true);
      const response = await api.post('/auth/refresh-token');
      const { token } = response.data;
      setToken(token);
      return token;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      removeToken();
      setUser(null);
      return null;
    } finally {
      setRefreshing(false);
    }
  };

  // 初始化认证状态
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const userData = await api.get('/auth/me');
          setUser(userData.data);
        } catch (error) {
          if (error.response?.status === 401) {
            // Token 过期，尝试刷新
            const newToken = await refreshToken();
            if (newToken) {
              // 使用新 token 重试获取用户信息
              const userData = await api.get('/auth/me');
              setUser(userData.data);
            }
          } else {
            console.error('Failed to restore session:', error);
            removeToken();
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // 定期刷新 token
  useEffect(() => {
    if (user) {
      const refreshInterval = setInterval(async () => {
        await refreshToken();
      }, 14 * 60 * 1000); // 每14分钟刷新一次

      return () => clearInterval(refreshInterval);
    }
  }, [user]);

  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { token, user: userData } = response.data;
    setToken(token);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeToken();
      setUser(null);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    loading,
    refreshing,
    login,
    logout,
    updateUser,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
