import React from 'react';
import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-twitter-blue text-white hover:bg-twitter-blue-dark',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600',
  outline: 'border border-twitter-blue text-twitter-blue hover:bg-twitter-blue/10',
  danger: 'bg-red-500 text-white hover:bg-red-600',
  ghost: 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  className = '',
  type = 'button',
  ...props
}) => {
  const baseClasses = 'rounded-full font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-twitter-blue focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClasses = variants[variant];
  const sizeClasses = sizes[size];
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${widthClass} ${className}`}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default Button; 