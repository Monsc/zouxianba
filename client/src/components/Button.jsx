import React from 'react';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200';
  
  const variants = {
    primary: 'border-transparent text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-blue-500',
    danger: 'border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500',
    success: 'border-transparent text-white bg-green-600 hover:bg-green-700 focus:ring-green-500',
    warning: 'border-transparent text-white bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
  };

  const disabledStyles = 'opacity-50 cursor-not-allowed';

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${disabled ? disabledStyles : ''} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 