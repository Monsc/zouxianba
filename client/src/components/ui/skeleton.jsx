import * as React from 'react';
import { cn } from '@/lib/utils';

export const Skeleton = React.forwardRef(
  ({ className, variant = 'rect', ...props }, ref) => {
    const base = 'animate-pulse bg-[#1da1f2]/10 dark:bg-[#1a8cd8]/10';
    const variants = {
      rect: 'rounded-2xl',
      card: 'rounded-2xl',
      text: 'rounded-full h-4',
      avatar: 'rounded-full',
      button: 'rounded-full h-10',
    };
    return (
      <div
        ref={ref}
        className={cn(base, variants[variant], className)}
        {...props}
      />
    );
  }
);
Skeleton.displayName = 'Skeleton';

export default Skeleton; 