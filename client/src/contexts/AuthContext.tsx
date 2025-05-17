import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '../services/api';

interface User {
  id: string;
  username: string;
  handle: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, handle: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren<{}>) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for stored token and validate it
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
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

  const login = async (email: string, password: string) => {
    try {
      const { user, token } = await apiLogin(email, password);
      localStorage.setItem('token', token);
      setUser(user);
    } catch (error: unknown) {
      console.error('Login error:', error);
      throw error instanceof Error ? error : new Error('Unknown error');
    }
  };

  const register = async (username: string, email: string, password: string, handle: string) => {
    try {
      const { user, token } = await apiRegister(username, email, password, handle);
      localStorage.setItem('token', token);
      setUser(user);
    } catch (error: unknown) {
      console.error('Registration error in AuthContext:', error);
      throw error instanceof Error ? error : new Error('Unknown error');
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
      localStorage.removeItem('token');
      setUser(null);
    } catch (error: unknown) {
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