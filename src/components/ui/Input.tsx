import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-none border-2 border-black bg-white px-3 py-2 text-sm font-mono shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-black disabled:cursor-not-allowed disabled:opacity-50 transition-all",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
