import React from 'react';
import { cn } from '../lib/utils';

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'neo' }>(
  ({ className, variant = 'primary', ...props }, ref) => {
    const variants = {
      primary: 'bg-blue-600 text-slate-900 dark:text-slate-50 hover:bg-blue-700 active:scale-95 shadow-lg',
      secondary: 'bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-gray-700 active:scale-95',
      ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95',
      danger: 'bg-red-600 text-slate-900 dark:text-slate-50 hover:bg-red-700 active:scale-95',
      neo: 'neo-btn font-black text-gray-900 dark:text-slate-200',
    };
    return (
      <button
        ref={ref}
        className={cn('px-6 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed', variants[variant], className)}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
