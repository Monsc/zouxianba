import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

const Input = forwardRef(({
  label,
  error,
  className = '',
  type = 'text',
  fullWidth = false,
  ...props
}, ref) => {
  const baseClasses = 'w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-twitter-blue focus:bg-white dark:focus:bg-gray-700 focus:outline-none transition-colors duration-200';
  const errorClasses = error ? 'border-red-500 focus:border-red-500' : '';
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <div className={`${widthClass} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <motion.input
        ref={ref}
        type={type}
        className={`${baseClasses} ${errorClasses}`}
        whileFocus={{ scale: 1.01 }}
        {...props}
      />
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-red-500"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 