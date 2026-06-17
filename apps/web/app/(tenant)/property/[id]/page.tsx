'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Heart,
  MapPin,
  Bed,
  Bath,
  ShieldCheck,
  ChevronRight,
  MessageSquare,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { KoboDisplay } from '@/components/ui/KoboDisplay';
import { VerifiedBadge, type BadgeType } from '@/components/ui/VerifiedBadge';
import { StarRating } from '@/components/ui/StarRating';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { Button } from '@/components/ui/Button';
import { trpc } from '@/lib/trpc/react';

export default function PropertyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;

  const { data: property, isLoading } = trpc.properties.getById.useQuery({ id: propertyId });
  const { data: ratingData } = trpc.reviews.aggregateRating.useQuery({ propertyId });
  const { data: reviewsData } = trpc.reviews.list.useQuery({ propertyId, page: 1, limit: 10 });
  const { data: savedData } = trpc.properties.getSavedProperties.useQuery();
  const savedPropertyIds = savedData?.properties?.map((p: { id: string }) => p.id) ?? [];
  const [activeImageIdx] = React.useState(0);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-sand">
        <div className="h-[300px] bg-sand-warm animate-pulse" />
        <div className="flex-1 px-4 py-6 -mt-6 bg-sand rounded-t-[24px] relative z-10 space-y-4">
          <div className="h-8 bg-white animate-pulse rounded-lg w-3/4" />
          <div className="h-4 bg-white animate-pulse rounded-lg w-1/2" />
          <div className="h-6 bg-white animate-pulse rounded-lg w-1/3" />
          <div className="h-20 bg-white animate-pulse rounded-card" />
          <div className="h-40 bg-white animate-pulse rounded-card" />
        </div>
      </div>
    );
  }

  if (!property) return null;

  const owner = property.owner;
  const images = property.images ?? [];
  const currentImage = images[activeImageIdx];
  const average = ratingData?.average ?? 0;
  const count = ratingData?.count ?? 0;
  const reviews = reviewsData?.reviews ?? [];
  const isSaved = savedPropertyIds.includes(propertyId);

  return (
    <div className="flex flex-col min-h-screen bg-sand pb-[100px] md:pb-12">
      <div className="max-w-6xl mx-auto w-full md:pt-8 md:px-6 lg:px-12 flex flex-col md:flex-row gap-8 lg:gap-12">
        
        {/* Left Column: Media & Content */}
        <div className="flex-1 min-w-0">
          <div className="relative h-[300px] md:h-[450px] w-full bg-sand-warm overflow-hidden md:rounded-[24px] shadow-card">
            {currentImage?.url ? (
              <img
                src={currentImage.url}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-terra-light/30 to-terra/10 flex items-center justify-center">
                <span className="font-playfair italic text-terra-dark/20 text-6xl md:text-8xl">Awahouse</span>
              </div>
            )}

            <div className="absolute top-4 left-4 right-4 flex justify-between">
              <button
                onClick={() => router.back()}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 active:scale-95 transition-transform"
              >
                <ArrowLeft size={20} />
              </button>
              <button
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 active:scale-95 transition-transform"
              >
                <Heart size={20} className={cn(isSaved && 'fill-terra text-terra')} />
              </button>
            </div>

            {images.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full text-white text-[10px] font-mono">
                {activeImageIdx + 1}/{images.length}
              </div>
            )}
          </div>

          <div className="px-4 py-6 md:px-0 bg-sand relative z-10">
            <div className="mb-6 md:hidden">
              <h1 className="font-playfair italic font-black text-[28px] text-charcoal leading-tight mb-2">
                {property.title}
              </h1>
              {property.address && (
                <div className="flex items-center gap-1.5 text-muted mb-4">
                  <MapPin size={14} className="text-terra" />
                  <span className="text-[13px]">{property.address}</span>
                </div>
              )}
              <KoboDisplay kobo={Number(property.priceKobo)} size="display" />
            </div>

            {property.description && (
              <section className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-6 bg-terra-dark rounded-full" />
                  <h3 className="font-playfair font-bold text-lg text-charcoal uppercase tracking-wide">
                    Property Description
                  </h3>
                </div>
                <p className="text-base text-muted leading-8 font-sans">
                  {property.description}
                </p>
              </section>
            )}

            <section className="mb-10">
              <div className="flex justify-between items-end mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-terra-dark rounded-full" />
                  <h3 className="font-playfair font-bold text-lg text-charcoal uppercase tracking-wide">
                    Reviews ({count})
                  </h3>
                </div>
                {count > 0 && (
                  <button
                    onClick={() => router.push(`/property/${propertyId}/reviews`)}
                    className="text-terra font-bold text-xs flex items-center gap-1"
                  >
                    View all <ChevronRight size={14} />
                  </button>
                )}
              </div>

              {count > 0 ? (
                <>
                  <div className="bg-white border border-outline-variant rounded-card p-5 mb-6 flex items-center gap-8 shadow-sm">
                    <div className="text-center">
                      <div className="text-4xl font-playfair font-black text-charcoal mb-1">
                        {average.toFixed(1)}
                      </div>
                      <StarRating rating={average} size="sm" />
                      <div className="text-[10px] text-muted mt-2 font-mono uppercase">
                        {count} Review{count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {reviews.slice(0, 2).map((review) => (
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
                </>
              ) : (
                <div className="bg-white border border-outline-variant rounded-card p-8 text-center text-muted text-sm shadow-sm">
                  No reviews yet. Be the first to review this property.
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Right Column: Info & Actions (Sticky on Desktop) */}
        <div className="w-full md:w-[360px] lg:w-[400px] shrink-0">
          <div className="sticky top-8 space-y-6 px-4 md:px-0">
            {/* Main Info Card */}
            <div className="bg-white border border-outline-variant rounded-[24px] p-6 lg:p-8 shadow-card hidden md:block">
              <h1 className="font-playfair italic font-black text-3xl text-charcoal leading-tight mb-3">
                {property.title}
              </h1>
              {property.address && (
                <div className="flex items-start gap-1.5 text-muted mb-6">
                  <MapPin size={16} className="text-terra mt-0.5 shrink-0" />
                  <span className="text-sm leading-relaxed">{property.address}</span>
                </div>
              )}
              
              <div className="mb-8">
                <KoboDisplay kobo={Number(property.priceKobo)} size="display" />
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                <VerifiedBadge type={property.verificationBadge as BadgeType} />
                <div className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-badge border border-blue-200 text-[11px] font-mono font-bold flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  Escrow Eligible
                </div>
              </div>

              <div className="grid grid-cols-3 border border-outline-variant rounded-xl overflow-hidden bg-sand/20 mb-8">
                <div className="p-3 border-r border-outline-variant flex flex-col items-center text-center">
                  <Bed size={16} className="text-muted mb-1.5" />
                  <span className="text-[9px] font-mono uppercase text-muted mb-0.5">Beds</span>
                  <span className="text-sm font-bold text-charcoal">{property.bedrooms}</span>
                </div>
                <div className="p-3 border-r border-outline-variant flex flex-col items-center text-center">
                  <Bath size={16} className="text-muted mb-1.5" />
                  <span className="text-[9px] font-mono uppercase text-muted mb-0.5">Baths</span>
                  <span className="text-sm font-bold text-charcoal">{property.bathrooms}</span>
                </div>
                <div className="p-3 flex flex-col items-center text-center">
                  <Star size={16} className="text-muted mb-1.5" />
                  <span className="text-[9px] font-mono uppercase text-muted mb-0.5">Rating</span>
                  <span className="text-sm font-bold text-charcoal">
                    {average ? average.toFixed(1) : '—'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => router.push(`/escrow/initiate?propertyId=${propertyId}`)}
                  icon={<ShieldCheck size={20} />}
                >
                  Secure with Escrow
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  icon={<MessageSquare size={20} />}
                >
                  Tour this Property
                </Button>
              </div>
            </div>

            {/* Mobile-only grid (moved here for responsive flow) */}
            <div className="grid grid-cols-3 border border-outline-variant rounded-card overflow-hidden bg-white mb-8 md:hidden shadow-sm">
              <div className="p-4 border-r border-outline-variant flex flex-col items-center text-center">
                <Bed size={18} className="text-muted mb-2" />
                <span className="text-[10px] font-mono uppercase text-muted mb-1">Beds</span>
                <span className="text-sm font-bold text-charcoal">{property.bedrooms} En</span>
              </div>
              <div className="p-4 border-r border-outline-variant flex flex-col items-center text-center">
                <Bath size={18} className="text-muted mb-2" />
                <span className="text-[10px] font-mono uppercase text-muted mb-1">Baths</span>
                <span className="text-sm font-bold text-charcoal">{property.bathrooms}</span>
              </div>
              <div className="p-4 flex flex-col items-center text-center">
                <Star size={18} className="text-muted mb-2" />
                <span className="text-[10px] font-mono uppercase text-muted mb-1">Rating</span>
                <span className="text-sm font-bold text-charcoal">
                  {average ? `${average.toFixed(1)}` : '—'}
                </span>
              </div>
            </div>

            {/* Owner Info Card */}
            {owner && (
              <div className="bg-white border border-outline-variant rounded-[24px] p-5 shadow-card">
                <h4 className="font-mono text-[10px] uppercase text-muted tracking-widest mb-4">
                  {owner.activeRole === 'agent' ? 'Listing Agent' : 'Verified Landlord'}
                </h4>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-sand-warm flex items-center justify-center text-muted font-bold text-xl">
                    {owner.firstName?.[0] ?? 'O'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-charcoal truncate text-base">
                      {owner.firstName} {owner.lastName ?? ''}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <ShieldCheck size={12} className="text-terra" />
                      <span>{owner.activeRole === 'agent' ? 'LASRERA Verified' : 'NIN Verified'}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" fullWidth className="mt-4 border-none bg-sand/30 hover:bg-sand/50 text-terra-dark font-bold">
                  Message {owner.activeRole === 'agent' ? 'Agent' : 'Landlord'}
                </Button>
              </div>
            )}

            {/* Location Card */}
            <div className="bg-white border border-outline-variant rounded-[24px] p-5 shadow-card">
              <h4 className="font-mono text-[10px] uppercase text-muted tracking-widest mb-4">Location</h4>
              <div className="h-[140px] w-full rounded-xl bg-sand-deep border border-outline-variant relative flex items-center justify-center overflow-hidden">
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: 'radial-gradient(#3D3020 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                />
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className="w-8 h-8 bg-terra-dark rounded-full flex items-center justify-center text-white shadow-lg animate-bounce">
                    <MapPin size={18} />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-charcoal uppercase tracking-widest">
                    {property.lga}, Lagos
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/80 backdrop-blur-lg border-t border-outline-variant p-4 flex gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <Button
          variant="primary"
          size="lg"
          className="flex-1 shadow-none"
          onClick={() => router.push(`/escrow/initiate?propertyId=${propertyId}`)}
          icon={<ShieldCheck size={20} />}
        >
          Secure with Escrow
        </Button>
        <Button
          variant="secondary"
          size="lg"
          className="w-[120px] shadow-none"
          icon={<MessageSquare size={20} />}
        >
          Tour
        </Button>
      </div>
    </div>
  );
}
