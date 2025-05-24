import React from 'react';
import { useToast } from '../../contexts/ToastContext';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export const Toaster = () => {
  const { toasts, removeToast } = useToast();

  const getIcon = type => {
    if (type === 'success') return <CheckCircle className="w-5 h-5 text-green-400 mr-2" />;
    if (type === 'error') return <XCircle className="w-5 h-5 text-red-400 mr-2" />;
    return <Info className="w-5 h-5 text-blue-400 mr-2" />;
  };

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col items-end space-y-4">
      {Array.isArray(toasts) &&
        toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center max-w-xs p-4 rounded-2xl shadow-xl bg-white dark:bg-gray-800 border border-[#1da1f2] text-base font-medium animate-fade-in-up transition-all duration-300 ${
              toast.type === 'success'
                ? 'border-green-400'
                : toast.type === 'error'
                  ? 'border-red-400'
                  : 'border-[#1da1f2]'
            }`}
          >
            {getIcon(toast.type)}
            <span className="flex-1 text-gray-900 dark:text-gray-100">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-3 rounded-full p-1 hover:bg-accent transition"
              aria-label="关闭"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        ))}
    </div>
  );
};

export default Toaster;
