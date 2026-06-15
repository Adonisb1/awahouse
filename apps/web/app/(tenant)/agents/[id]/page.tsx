'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Home, MapPin } from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';
import { BottomNav } from '@/components/layout/BottomNav';
import { KoboDisplay } from '@/components/ui/KoboDisplay';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { trpc } from '@/lib/trpc/react';

export default function AgentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const agentId = params.id as string;

  const { data: agent, isLoading } = trpc.agent.getPublicProfile.useQuery({ id: agentId });
  const { data: reviewsData } = trpc.reviews.list.useQuery({ revieweeId: agentId, page: 1, limit: 10 });

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-sand">
        <TopNav variant="back" title="Agent" />
        <div className="flex-1 px-4 py-8 space-y-4">
          <div className="h-24 bg-white rounded-card animate-pulse" />
          <div className="h-48 bg-white rounded-card animate-pulse" />
        </div>
      </div>
    );
  }

  if (!agent) return null;

  const reviews = reviewsData?.reviews ?? [];

  return (
    <div className="flex flex-col min-h-screen bg-sand pb-[100px]">
      <TopNav variant="back" title={agent.name} />

      <div className="flex-1 px-4 py-6">
        <div className="bg-white border border-outline-variant rounded-card p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-terra/10 flex items-center justify-center text-terra-dark font-bold text-2xl">
              {agent.name[0] ?? 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-2xl font-bold text-charcoal truncate">
                {agent.name}
              </h1>
              {agent.firm && (
                <p className="text-sm text-charcoal/60">{agent.firm}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {agent.professionalBodies.map((body) => (
              <span
                key={body}
                className="bg-terra-50 text-terra-dark text-[10px] font-mono px-2 py-0.5 rounded-badge border border-terra/10 font-bold uppercase"
              >
                {body}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-outline-variant">
            <div className="text-center">
              <div className="text-lg font-bold text-charcoal">{agent.escrowCount}</div>
              <div className="text-[10px] font-mono uppercase text-muted">Escrows</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-charcoal">
                {agent.avgRating ? agent.avgRating.toFixed(1) : '—'}
              </div>
              <div className="text-[10px] font-mono uppercase text-muted">Rating</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-charcoal">{agent.listings.length}</div>
              <div className="text-[10px] font-mono uppercase text-muted">Listings</div>
            </div>
          </div>
        </div>

        {agent.listings.length > 0 && (
          <section className="mb-6">
            <h2 className="font-display text-lg font-bold text-charcoal mb-4">
              Listings ({agent.listings.length})
            </h2>
            <div className="space-y-3">
              {agent.listings.slice(0, 5).map((listing) => (
                <div
                  key={listing.id}
                  className="bg-white border border-outline-variant rounded-card p-4 flex gap-4 shadow-sm cursor-pointer hover:border-terra transition-colors"
                  onClick={() => router.push(`/property/${listing.id}`)}
                >
                  <div className="w-16 h-16 rounded-xl bg-sand-warm overflow-hidden shrink-0 flex items-center justify-center text-terra/30">
                    <Home size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-charcoal text-sm truncate">{listing.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted mt-1">
                      <MapPin size={12} />
                      <span>{listing.lga}</span>
                    </div>
                    <KoboDisplay kobo={Number(listing.priceKobo)} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-6 bg-terra-dark rounded-full" />
            <h2 className="font-display text-lg font-bold text-charcoal uppercase tracking-wide">
              Reviews ({agent.reviewCount})
            </h2>
          </div>

          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.slice(0, 3).map((review) => (
                <ReviewCard
                  key={review.id}
                  id={review.id}
                  authorName={`${review.reviewer.firstName} ${review.reviewer.lastName ?? ''}`}
                  authorInitials={(review.reviewer.firstName?.[0] ?? 'U').toUpperCase()}
                  authorAvatarUrl={review.reviewer.avatarUrl}
                  rating={review.rating}
                  body={review.comment ?? ''}
                  createdAt={review.createdAt.toISOString()}
                  isVerifiedTransaction={review.isVerified}
                  helpfulCount={0}
                  onMarkHelpful={() => {}}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-outline-variant rounded-card p-8 text-center text-muted text-sm">
              No reviews yet.
            </div>
          )}
        </section>
      </div>
      <BottomNav role="TENANT" />
    </div>
  );
}
