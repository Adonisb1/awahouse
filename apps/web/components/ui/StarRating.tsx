'use client';

import * as React from 'react';
import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (_rating: number) => void;
  showValue?: boolean;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  size = 'md',
  interactive = false,
  onChange,
  showValue = false,
  className,
}) => {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);
  const displayRating = hoverRating !== null ? hoverRating : rating;

  const iconSize = {
    sm: 14,
    md: 18,
    lg: 24,
  }[size];

  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  const renderStar = (starValue: number) => {
    const isFull = displayRating >= starValue;
    const isHalf = !isFull && displayRating >= starValue - 0.5;

    return (
      <div
        key={starValue}
        className={cn(
          'transition-colors duration-150',
          interactive ? 'cursor-pointer' : 'pointer-events-none'
        )}
        onMouseEnter={() => interactive && setHoverRating(starValue)}
        onMouseLeave={() => interactive && setHoverRating(null)}
        onClick={() => interactive && onChange?.(starValue)}
      >
        {isHalf ? (
          <div className="relative">
            <Star className="text-outline-variant" size={iconSize} />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <StarHalf className="text-amber-400 fill-amber-400" size={iconSize} />
            </div>
          </div>
        ) : (
          <Star
            className={cn(
              isFull ? 'text-amber-400 fill-amber-400' : 'text-outline-variant'
            )}
            size={iconSize}
          />
        )}
      </div>
    );
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex gap-0.5">{stars.map(renderStar)}</div>
      {showValue && (
        <span
          className={cn(
            'font-bold text-charcoal ml-1',
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
          )}
        >
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export { StarRating };
