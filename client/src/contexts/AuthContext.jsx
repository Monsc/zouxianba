import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { getToken, setToken, removeToken } from '../utils/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 刷新 token
  const refreshToken = async () => {
    try {
      setRefreshing(true);
      const response = await apiService.refreshToken();
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
    const checkAuth = async () => {
      try {
        const userData = await apiService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
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
    try {
      const userData = await apiService.login(credentials);
      // 自动保存 token
      if (userData && userData.token) {
        setToken(userData.token);
      }
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiService.register(userData);
      setUser(response);
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
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
    register,
    logout,
    updateUser,
    refreshToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

export { AuthContext };
