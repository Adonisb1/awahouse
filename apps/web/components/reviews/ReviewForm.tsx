'use client';

import { useState } from 'react';
import { StarRating } from './StarRating';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';

type ReviewFormProps = {
  revieweeId: string;
  propertyId?: string;
  escrowId?: string;
  type: 'property' | 'landlord' | 'agent';
  onSubmit: (_data: { rating: number; comment?: string }) => Promise<void>;
};

export function ReviewForm({ onSubmit, ..._props }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (rating < 1) return;
    setSubmitting(true);
    setError('');
    try {
      await onSubmit({ rating, comment: comment || undefined });
    } catch (err: any) {
      setError(err?.message ?? 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-display text-lg font-bold text-charcoal mb-4">Write a review</h3>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-2">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <p className="font-body text-sm text-charcoal/60 mb-2">Rating</p>
            <StarRating rating={rating} size="lg" interactive onChange={setRating} />
          </div>
          <Input
            label="Comment (optional)"
            placeholder="Share your experience..."
            value={comment}
            onChangeValue={setComment}
          />
          <Button onClick={handleSubmit} disabled={rating < 1 || submitting}>
            {submitting ? 'Submitting...' : 'Submit review'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
