import React from 'react';
import { cn } from '@/lib/utils';

export const Textarea = ({ className, error, ...props }) => {
  return (
    <div className="space-y-1">
      <textarea
        className={cn(
          'w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100',
          error && 'border-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};
