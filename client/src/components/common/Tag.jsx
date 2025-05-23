import React from 'react';

const Tag = ({
  children,
  variant = 'default',
  size = 'md',
  onClick,
  className = '',
  closable = false,
  onClose,
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary text-white',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
    >
      {children}
      {closable && (
        <button
          type="button"
          className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-gray-200 focus:outline-none"
          onClick={e => {
            e.stopPropagation();
            onClose?.();
          }}
        >
          <span className="sr-only">移除标签</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </span>
  );
};

export default Tag;
