import * as React from 'react';
import { cn } from '@/lib/utils';

const Button = React.forwardRef(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';

    const variants = {
      default: 'bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 rounded-full',
      destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 rounded-full',
      outline:
        'border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground rounded-full',
      secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 rounded-full',
      ghost: 'hover:bg-accent hover:text-accent-foreground rounded-full',
      link: 'text-primary underline-offset-4 hover:underline',
    };

    const sizes = {
      default: 'h-10 px-6 py-2',
      sm: 'h-8 rounded-full px-4 text-sm',
      lg: 'h-12 rounded-full px-8 text-lg',
      icon: 'h-10 w-10 p-0 rounded-full',
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
