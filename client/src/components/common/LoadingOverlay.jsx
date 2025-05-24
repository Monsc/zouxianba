import React from 'react';
import LoadingSpinner from '../LoadingSpinner';

const LoadingOverlay = ({ isLoading, text = '加载中...', children, className = '' }) => {
  if (!isLoading) {
    return children;
  }

  return (
    <div className="relative">
      {children}
      <div
        className={`absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 ${className}`}
      >
        <div className="text-center">
          <LoadingSpinner size="lg" />
          {text && <p className="mt-2 text-sm text-gray-600">{text}</p>}
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
