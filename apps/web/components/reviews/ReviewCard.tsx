'use client';

import * as React from 'react';
import { ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { StarRating } from '@/components/ui/StarRating';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';

export interface ReviewCardProps {
  id: string;
  authorName: string;
  authorInitials: string;
  authorAvatarUrl: string | null;
  rating: number;
  body: string;
  createdAt: string;
  isVerifiedTransaction: boolean;
  helpfulCount: number;
  onMarkHelpful: (_id: string) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  id,
  authorName,
  authorInitials,
  authorAvatarUrl,
  rating,
  body,
  createdAt,
  isVerifiedTransaction,
  helpfulCount,
  onMarkHelpful,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const bodyRef = React.useRef<HTMLParagraphElement>(null);
  const [isClamped, setIsClamped] = React.useState(false);

  React.useEffect(() => {
    if (bodyRef.current) {
      const { scrollHeight, clientHeight } = bodyRef.current;
      setIsClamped(scrollHeight > clientHeight);
    }
  }, [body]);

  return (
    <div className="bg-white border border-outline-variant rounded-card p-5 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sand-deep flex items-center justify-center text-charcoal font-bold text-sm border-2 border-white shadow-sm overflow-hidden">
            {authorAvatarUrl ? (
              <img src={authorAvatarUrl} alt={authorName} className="w-full h-full object-cover" />
            ) : (
              authorInitials
            )}
          </div>
          <div>
            <h5 className="font-bold text-charcoal text-sm leading-none mb-1">{authorName}</h5>
            <StarRating rating={rating} size="sm" />
          </div>
        </div>
        <span className="text-[11px] font-mono text-muted uppercase tracking-wider">
          {createdAt}
        </span>
      </div>

      {isVerifiedTransaction && (
        <div className="mb-3">
          <VerifiedBadge type="transaction_verified" size="sm" />
        </div>
      )}

      <div className="relative">
        <p
          ref={bodyRef}
          className={cn(
            'text-sm text-muted leading-relaxed font-sans transition-all duration-300',
            !isExpanded && 'line-clamp-3'
          )}
        >
          {body}
        </p>
        {isClamped && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="text-terra font-bold text-xs mt-1 hover:underline focus:outline-none"
          >
            Read more
          </button>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-outline-variant pt-4">
        <button
          onClick={() => onMarkHelpful(id)}
          className="flex items-center gap-2 text-muted hover:text-terra transition-colors group"
        >
          <ThumbsUp size={14} className="group-active:scale-125 transition-transform" />
          <span className="text-[11px] font-mono font-medium">
            Helpful ({helpfulCount})
          </span>
        </button>
      </div>
    </div>
  );
};

export { ReviewCard };
