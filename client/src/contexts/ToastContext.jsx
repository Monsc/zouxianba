import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '@/components/common/Toast';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  try {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success', duration = 3000) => {
      const id = Date.now();
      setToasts(prevToasts => [...prevToasts, { id, message, type, duration }]);
    }, []);

    const removeToast = useCallback(id => {
      setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, []);

    const success = useCallback(
      (message, duration) => addToast(message, 'success', duration),
      [addToast]
    );

    const error = useCallback(
      (message, duration) => addToast(message, 'error', duration),
      [addToast]
    );

    const warning = useCallback(
      (message, duration) => addToast(message, 'warning', duration),
      [addToast]
    );

    const info = useCallback(
      (message, duration) => addToast(message, 'info', duration),
      [addToast]
    );

    return (
      <ToastContext.Provider value={{ success, error, warning, info }}>
        {children}
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </ToastContext.Provider>
    );
  } catch (e) {
    console.error('ToastProvider 初始化异常:', e, e?.message, e?.stack);
    throw e;
  }
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    console.error('useToast must be used within a ToastProvider');
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastProvider;

export { ToastContext };
