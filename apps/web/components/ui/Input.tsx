'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'suffix' | 'onChange'> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  onChange?: ((val: string) => void) | React.ChangeEventHandler<HTMLInputElement>;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (allProps, ref) => {
    const { className, label, error, hint, prefix, suffix, type, onChange, ...nativeProps } = allProps;
    const hasRegisterName = 'name' in nativeProps;

    return (
      <div className="w-full">
        {label && (
          <label className="block font-mono text-[11px] uppercase tracking-widest text-muted mb-1.5">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <div className="absolute left-4 flex items-center pointer-events-none text-muted">
              {prefix}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            onChange={(e) => {
              if (onChange) {
                if (hasRegisterName) {
                  (onChange as React.ChangeEventHandler<HTMLInputElement>)(e);
                } else {
                  (onChange as (val: string) => void)(e.target.value);
                }
              }
            }}
            className={cn(
              'h-[52px] w-full rounded-input border border-outline-variant bg-white px-4 font-sans transition-all duration-200 focus:border-terra-dark focus:ring-0 outline-none',
              error && 'border-red-400',
              prefix && 'pl-14',
              suffix && 'pr-12',
              className
            )}
            {...nativeProps}
          />
          {suffix && (
            <div className="absolute right-4 flex items-center text-muted">
              {suffix}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
