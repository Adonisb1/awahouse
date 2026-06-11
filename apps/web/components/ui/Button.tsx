'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, fullWidth, icon, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-terra-dark text-white hover:opacity-90 shadow-fab active:scale-[0.98]',
      secondary: 'border-2 border-terra-dark text-terra-dark hover:bg-sand',
      ghost: 'bg-sand-warm text-muted hover:bg-sand-deep',
      danger: 'bg-red-600 text-white',
    };

    const sizes = {
      sm: 'h-[36px] px-3 text-sm',
      md: 'h-[44px] px-4',
      lg: 'h-[52px] px-6 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center rounded-button font-sans font-bold tracking-wide transition-all duration-200 focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : icon ? (
          <span className="mr-2">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
