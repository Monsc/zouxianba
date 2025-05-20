import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  hover = false,
  onClick,
  ...props
}) => {
  const baseClasses = 'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700';
  const hoverClasses = hover ? 'hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200' : '';

  return (
    <motion.div
      whileHover={hover ? { scale: 1.01 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`${baseClasses} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// 卡片头部
Card.Header = ({ children, className = '' }) => (
  <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);

// 卡片内容
Card.Body = ({ children, className = '' }) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
);

// 卡片底部
Card.Footer = ({ children, className = '' }) => (
  <div className={`p-4 border-t border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);

export default Card; 