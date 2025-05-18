import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '../services/api';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored token and validate it
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setUser(data);
            setIsLoading(false);
          } else {
            setUser(null);
            setIsLoading(false);
          }
        } catch (error) {
          setUser(null);
          setIsLoading(false);
        }
      } else {
        setUser(null);
        setIsLoading(false);
      }
    };

    validateToken();
  }, []);

  // 注册
  const register = async (username, email, password, handle) => {
    const res = await apiRegister(username, email, password, handle);
    if (res.token && res.user) {
      localStorage.setItem('token', res.token);
      setUser(res.user);
    } else {
      throw new Error(res.message || 'Registration failed');
    }
  };

  // 登录
  const login = async (email, password) => {
    const res = await apiLogin(email, password);
    if (res.token && res.user) {
      localStorage.setItem('token', res.token);
      setUser(res.user);
    } else {
      throw new Error(res.message || 'Login failed');
    }
  };

  // 登出
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    apiLogout && apiLogout();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
