import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    console.error('useTheme must be used within a ThemeProvider');
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  try {
    const [theme, setTheme] = useState(() => {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme || 'light';
    });

    useEffect(() => {
      localStorage.setItem('theme', theme);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
    }, [theme]);

    const toggleTheme = () => {
      setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const value = {
      theme,
      toggleTheme,
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
  } catch (e) {
    console.error('ThemeProvider 初始化异常:', e, e?.message, e?.stack);
    throw e;
  }
};

export default ThemeProvider;
