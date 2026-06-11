import * as React from 'react';
import { cn } from '@/lib/utils/cn';

interface KoboDisplayProps {
  kobo: number;
  period?: 'yearly' | 'monthly' | null;
  size?: 'sm' | 'md' | 'lg' | 'display';
  color?: 'terra' | 'charcoal' | 'muted';
  className?: string;
}

const KoboDisplay: React.FC<KoboDisplayProps> = ({
  kobo,
  period = null,
  size = 'md',
  color = 'terra',
  className,
}) => {
  const naira = kobo / 100;
  
  const formatter = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  });

  const formattedValue = formatter.format(naira);

  const sizeStyles = {
    sm: 'text-sm font-bold',
    md: 'text-base font-bold',
    lg: 'text-xl font-bold',
    display: 'text-[28px] font-playfair font-bold',
  };

  const colorStyles = {
    terra: 'text-terra-dark',
    charcoal: 'text-charcoal',
    muted: 'text-muted',
  };

  return (
    <div className={cn('inline-flex items-baseline gap-1', className)}>
      <span className={cn(sizeStyles[size], colorStyles[color])}>
        {formattedValue}
      </span>
      {period && (
        <span className="text-muted text-xs font-sans">
          /{period === 'yearly' ? 'yr' : 'mo'}
        </span>
      )}
    </div>
  );
};

export { KoboDisplay };
