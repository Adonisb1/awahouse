'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="font-body text-sm font-medium text-charcoal">
            {label}
          </label>
        )}
        <input
          id={id}
          className={cn(
            'h-11 w-full rounded-lg border border-charcoal/20 bg-white px-4 font-body text-charcoal placeholder:text-charcoal/40',
            'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className,
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input };
