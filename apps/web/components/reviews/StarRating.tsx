'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type StarRatingProps = {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (_rating: number) => void;
};

const sizeMap = { sm: 'h-3 w-3', md: 'h-5 w-5', lg: 'h-7 w-7' };

export function StarRating({ rating, max = 5, size = 'md', interactive, onChange }: StarRatingProps) {
  const stars = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <div className="flex items-center gap-0.5">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          className={cn(
            'transition-colors',
            interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default',
          )}
        >
          <Star
            className={cn(
              sizeMap[size],
              star <= rating ? 'fill-orange-400 text-orange-400' : 'fill-none text-charcoal/20',
            )}
          />
        </button>
      ))}
    </div>
  );
}
