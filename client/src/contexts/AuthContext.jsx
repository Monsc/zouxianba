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
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data);
          } else {
            console.error('Token validation failed:', await response.text());
            localStorage.removeItem('token');
            setUser(null);
          }
        } catch (error) {
          console.error('Token validation error:', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    validateToken();
  }, []);

  const login = async (email, password) => {
    try {
      const { user: userData, token } = await apiLogin(email, password);
      localStorage.setItem('token', token);
      setUser({ ...userData, id: userData._id });
    } catch (error) {
      console.error('Login error:', error);
      throw error instanceof Error ? error : new Error('Unknown error');
    }
  };

  const register = async (username, email, password, handle) => {
    try {
      const { user, token } = await apiRegister(username, email, password, handle);
      localStorage.setItem('token', token);
      setUser(user);
    } catch (error) {
      console.error('Registration error in AuthContext:', error);
      throw error instanceof Error ? error : new Error('Unknown error');
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
      localStorage.removeItem('token');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error instanceof Error ? error : new Error('Unknown error');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
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
