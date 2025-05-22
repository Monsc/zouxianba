import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '@/services/api';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await apiService.get('/users/me');
        setUser(response.data);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await apiService.post('/users/login', { email, password });
      const { accessToken, user } = response.data;
      localStorage.setItem('token', accessToken);
      setUser(user);
      return user;
    } catch (error) {
      throw new Error(error.response?.data?.message || '登录失败');
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiService.post('/users/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '注册失败');
    }
  };

  const logout = async () => {
    try {
      await apiService.post('/users/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await apiService.patch('/users/me', data);
      setUser(response.data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '更新资料失败');
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
