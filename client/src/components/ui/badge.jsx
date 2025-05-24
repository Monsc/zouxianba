import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#1da1f2] focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-[#1da1f2] text-white hover:bg-[#1a8cd8]',
        secondary:
          'border-transparent bg-gray-200 text-gray-800 hover:bg-gray-300',
        destructive:
          'border-transparent bg-red-500 text-white hover:bg-red-600',
        outline: 'text-[#1da1f2] border-[#1da1f2]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
