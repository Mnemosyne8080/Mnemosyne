import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-mono font-bold uppercase tracking-wider transition-all duration-100 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
      primary: "bg-black text-white border-2 border-black hover:bg-gray-800 active:translate-x-[2px] active:translate-y-[2px]",
      secondary: "bg-white text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
      danger: "bg-red-500 text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
      ghost: "bg-transparent text-black border-2 border-transparent hover:border-black active:bg-gray-200"
    };

    const sizes = {
      sm: "px-2 py-1 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base"
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
