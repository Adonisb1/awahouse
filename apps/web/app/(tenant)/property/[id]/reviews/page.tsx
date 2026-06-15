'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { TopNav } from '@/components/layout/TopNav';
import { BottomNav } from '@/components/layout/BottomNav';
import { StarRating } from '@/components/ui/StarRating';
import { ReviewCard, type ReviewCardProps } from '@/components/reviews/ReviewCard';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Review } from '@awahouse/db';
import { trpc } from '@/lib/trpc/react';

export default function ReviewsPage() {
  const params = useParams();
  const propertyId = params.id as string;

  const [activeFilter, setActiveFilter] = React.useState('All');
  const [showWriteSheet, setShowWriteSheet] = React.useState(false);
  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState('');
  const [submitError, setSubmitError] = React.useState('');

  const utils = trpc.useUtils();
  const { data: property } = trpc.properties.getById.useQuery({ id: propertyId });
  const { data: reviewsData, isLoading: reviewsLoading } = trpc.reviews.list.useQuery({ propertyId });
  const { data: aggregateData } = trpc.reviews.aggregateRating.useQuery({ propertyId });
  const createReview = trpc.reviews.create.useMutation();

  const reviews = (reviewsData?.reviews ?? []) as Review[];
  const aggregate = aggregateData?.average;

  const handleSubmitReview = async () => {
    if (rating < 1) return;
    setSubmitError('');
    try {
      await createReview.mutateAsync({
        revieweeId: property?.ownerId ?? '',
        propertyId,
        type: 'property',
        rating,
        comment: comment || undefined,
      });
      setShowWriteSheet(false);
      setRating(0);
      setComment('');
      utils.reviews.list.invalidate({ propertyId });
      utils.reviews.aggregateRating.invalidate({ propertyId });
    } catch (e: any) {
      setSubmitError(e?.message ?? 'Failed to submit review');
    }
  };

  const filteredReviews = activeFilter === 'All'
    ? reviews
    : activeFilter === 'Critical'
      ? reviews.filter(r => r.rating <= 2)
      : reviews.filter(r => r.rating === parseInt(activeFilter));

  return (
    <div className="flex flex-col min-h-screen bg-sand pb-[80px]">
      <TopNav variant="back" title="Reviews" />

      <div className="flex-1 overflow-y-auto px-4 py-6">
        {/* Rating Overview */}
        <section className="flex flex-col items-center mb-10">
          {aggregate != null ? (
            <>
              <span className="text-6xl font-playfair font-black text-success mb-2">
                {aggregate.toFixed(1)}
              </span>
              <StarRating rating={Math.round(aggregate)} size="lg" className="mb-2" />
              <span className="text-[13px] text-muted font-mono uppercase tracking-widest">
                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </span>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="w-20 h-12" />
              <Skeleton className="w-40 h-4" />
            </div>
          )}
        </section>

        {/* Rating Bars */}
        <section className="space-y-3 mb-10">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = reviews.filter(r => r.rating === stars).length;
            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-4">
                <span className="text-xs font-bold text-muted w-4">{stars}★</span>
                <div className="flex-1 h-2 bg-sand-deep rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-success"
                  />
                </div>
                <span className="text-[10px] font-mono text-muted w-8">{Math.round(pct)}%</span>
              </div>
            );
          })}
        </section>

        {/* Write Review CTA */}
        <section className="mb-10">
          <button
            onClick={() => setShowWriteSheet(true)}
            className="w-full p-5 bg-terra-50 border border-terra/20 rounded-card flex items-center justify-between group active:scale-[0.98] transition-all"
          >
            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 rounded-full bg-terra/10 flex items-center justify-center text-terra">
                <MessageSquare size={20} />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-terra-dark text-sm">Write a Review</h4>
                <p className="text-xs text-terra/70">Share your experience with others</p>
              </div>
            </div>
            <span className="text-terra font-black text-xl group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </section>

        {/* Filters */}
        <section className="mb-6">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {['All', '5★', '4★', '3★', 'Critical'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  'px-4 py-2 rounded-chip text-xs font-bold whitespace-nowrap transition-all border',
                  activeFilter === filter
                    ? 'bg-charcoal text-white border-charcoal shadow-sm'
                    : 'bg-white text-muted border-outline-variant'
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        {/* Reviews List */}
        {reviewsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-card" />)}
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white border border-outline-variant rounded-card p-8 text-center shadow-sm">
            <p className="text-sm text-charcoal/60">No reviews yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <ReviewCard key={review.id} {...review as unknown as ReviewCardProps} onMarkHelpful={() => {}} />
            ))}
          </div>
        )}
      </div>

      <BottomNav role="TENANT" />

      {/* Write Review Sheet */}
      <AnimatePresence>
        {showWriteSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWriteSheet(false)}
              className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-[100] max-w-[430px] mx-auto"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[101] max-w-[430px] mx-auto bg-white rounded-t-[32px] p-6 shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-outline-variant/30 rounded-full mx-auto mb-8" />
              
              <div className="flex justify-between items-start mb-6">
                <h3 className="font-playfair font-bold text-2xl text-charcoal">Write a Review</h3>
                <button 
                  onClick={() => setShowWriteSheet(false)}
                  className="w-8 h-8 rounded-full bg-sand flex items-center justify-center text-muted"
                >
                  <X size={18} />
                </button>
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
                  {submitError}
                </div>
              )}

              <div className="mb-8 flex flex-col items-center">
                <StarRating rating={rating} size="lg" interactive onChange={setRating} />
                <p className="text-[10px] font-mono text-muted uppercase tracking-widest mt-2">Tap to rate</p>
              </div>

              <div className="mb-6">
                <textarea
                  placeholder="How was your stay? Consider the location, agent, and property condition..."
                  className="w-full min-h-[160px] p-4 rounded-input border border-outline-variant bg-sand/30 font-sans text-sm focus:border-terra outline-none transition-all resize-none"
                  maxLength={1000}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <div className="flex justify-between mt-2">
                  <div className="bg-success-bg text-success text-[10px] font-mono px-2 py-0.5 rounded-badge border border-success/20">
                    ✓ Verified Transaction
                  </div>
                  <span className="text-[10px] font-mono text-muted uppercase">{comment.length} / 1000</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                loading={createReview.isPending}
                disabled={rating < 1}
                onClick={handleSubmitReview}
              >
                Submit Review
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
