'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { TopNav } from '@/components/layout/TopNav';
import { BottomNav } from '@/components/layout/BottomNav';
import { StarRating } from '@/components/ui/StarRating';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { Button } from '@/components/ui/Button';
import { mockReviews, mockProperties } from '@/lib/mock';

export default function ReviewsPage() {
  const params = useParams();
  const propertyId = params.id as string;
  const property = (mockProperties.find(p => p.id === propertyId) || mockProperties[0])!;
  
  const [activeFilter, setActiveFilter] = React.useState('All');
  const [showWriteSheet, setShowWriteSheet] = React.useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-sand pb-[80px]">
      <TopNav variant="back" title="Reviews" />

      <div className="flex-1 overflow-y-auto px-4 py-6">
        {/* Rating Overview */}
        <section className="flex flex-col items-center mb-10">
          <span className="text-6xl font-playfair font-black text-success mb-2">
            {property.rating}
          </span>
          <StarRating rating={property.rating || 0} size="lg" className="mb-2" />
          <span className="text-[13px] text-muted font-mono uppercase tracking-widest">
            {property.reviewCount} verified reviews
          </span>
        </section>

        {/* Rating Bars */}
        <section className="space-y-3 mb-10">
          {[
            { stars: 5, pct: 78 },
            { stars: 4, pct: 17 },
            { stars: 3, pct: 4 },
            { stars: 2, pct: 0 },
            { stars: 1, pct: 1 },
          ].map((item) => (
            <div key={item.stars} className="flex items-center gap-4">
              <span className="text-xs font-bold text-muted w-4">{item.stars}★</span>
              <div className="flex-1 h-2 bg-sand-deep rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.pct}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-success"
                />
              </div>
              <span className="text-[10px] font-mono text-muted w-8">{item.pct}%</span>
            </div>
          ))}
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
                <h4 className="font-bold text-terra-dark text-sm">You stayed here</h4>
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
        <div className="space-y-4">
          {mockReviews.map((review) => (
            <ReviewCard key={review.id} {...review} onMarkHelpful={() => {}} />
          ))}
        </div>
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

              <div className="mb-8 flex flex-col items-center">
                <StarRating rating={0} interactive size="lg" />
                <p className="text-[10px] font-mono text-muted uppercase tracking-widest mt-2">Tap to rate</p>
              </div>

              <div className="mb-6">
                <textarea
                  placeholder="How was your stay? Consider the location, agent, and property condition..."
                  className="w-full min-h-[160px] p-4 rounded-input border border-outline-variant bg-sand/30 font-sans text-sm focus:border-terra outline-none transition-all resize-none"
                  maxLength={1000}
                />
                <div className="flex justify-between mt-2">
                  <div className="bg-success-bg text-success text-[10px] font-mono px-2 py-0.5 rounded-badge border border-success/20">
                    ✓ Verified Transaction
                  </div>
                  <span className="text-[10px] font-mono text-muted uppercase">0 / 1000</span>
                </div>
              </div>

              <Button variant="primary" size="lg" fullWidth onClick={() => setShowWriteSheet(false)}>
                Submit Review
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
