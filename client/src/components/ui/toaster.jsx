import React from 'react';
import { useToast } from '../../contexts/ToastContext';

export const Toaster = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-0 right-0 p-4 space-y-4 z-50">
      {Array.isArray(toasts) &&
        toasts.map(toast => (
          <div
            key={toast.id}
            className={`p-4 rounded-lg shadow-lg transform transition-all duration-300 ${
              toast.type === 'success'
                ? 'bg-green-500'
                : toast.type === 'error'
                  ? 'bg-red-500'
                  : 'bg-blue-500'
            } text-white`}
          >
            <div className="flex items-center justify-between">
              <p>{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-4 text-white hover:text-gray-200"
              >
                ×
              </button>
            </div>
          </div>
        ))}
    </div>
  );
};

export default Toaster;
