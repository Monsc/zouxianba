import React from 'react';
import { cn } from '../lib/utils';

export const LoadingSpinner = ({ size = 'md', className, bar = false }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  if (bar) {
    // 顶部 loading bar 风格
    return (
      <div className={cn('fixed top-0 left-0 w-full z-50')}> 
        <div className="h-1 bg-gradient-to-r from-primary via-blue-400 to-primary animate-loading-bar rounded-full" />
      </div>
    );
  }

  return (
    <div className={cn('flex justify-center items-center', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-[#1da1f2]',
          sizeClasses[size]
        )}
      />
    </div>
  );
};

export default LoadingSpinner;
