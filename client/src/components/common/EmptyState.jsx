import React from 'react';

const EmptyState = ({ title, description, icon, action, className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      {icon && <div className="w-16 h-16 text-gray-400 mb-4">{icon}</div>}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-6 max-w-sm">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
