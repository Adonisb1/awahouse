'use client';

import { StarRating } from './StarRating';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

type ReviewCardProps = {
  review: {
    id: string;
    rating: number;
    comment?: string | null;
    isVerified: boolean;
    createdAt: string | Date;
    reviewer: {
      firstName?: string | null;
      lastName?: string | null;
    };
  };
};

export function ReviewCard({ review }: ReviewCardProps) {
  const date = new Date(review.createdAt).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="font-body font-medium text-charcoal">
              {review.reviewer.firstName ?? 'Anonymous'} {review.reviewer.lastName ?? ''}
            </p>
            <StarRating rating={review.rating} size="sm" />
          </div>
          <div className="flex items-center gap-2">
            {!review.isVerified && <Badge variant="pending">Unverified</Badge>}
            <span className="font-body text-xs text-charcoal/40">{date}</span>
          </div>
        </div>
        {review.comment && (
          <p className="mt-2 font-body text-sm text-charcoal/70 leading-relaxed">{review.comment}</p>
        )}
      </CardContent>
    </Card>
  );
}
