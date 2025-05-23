import React from 'react';
import { LazyImage } from './LazyImage';

export const Avatar = ({ src, alt, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={`relative rounded-full overflow-hidden ${sizeClasses[size]} ${className}`}>
      <LazyImage src={src} alt={alt} className="w-full h-full object-cover" />
    </div>
  );
};

export default Avatar;
