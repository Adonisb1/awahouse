'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Heart, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize2, 
  ShieldCheck,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { KoboDisplay } from '@/components/ui/KoboDisplay';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { StarRating } from '@/components/ui/StarRating';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { AgentCard } from '@/components/agents/AgentCard';
import { mockProperties, mockAgents, mockReviews } from '@/lib/mock';
import { Button } from '@/components/ui/Button';

export default function PropertyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  const property = (mockProperties.find(p => p.id === propertyId) || mockProperties[0])!;
  const agent = (mockAgents.find(a => a.id === property.agentId) || mockAgents[0])!;

  return (
    <div className="flex flex-col min-h-screen bg-sand pb-[100px]">
      {/* Hero Section */}
      <div className="relative h-[300px] w-full bg-sand-warm overflow-hidden">
        {property.imageUrl ? (
          <img src={property.imageUrl} alt={property.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-terra-light/30 to-terra/10 flex items-center justify-center">
            <span className="font-playfair italic text-terra-dark/20 text-6xl">Awahouse</span>
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
            <Heart size={20} className={cn(property.isSaved && 'fill-terra text-terra')} />
          </button>
        </div>

        <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full text-white text-[10px] font-mono">
          1/12 📷
        </div>
      </div>

      {/* Body Section */}
      <div className="flex-1 px-4 py-6 -mt-6 bg-sand rounded-t-[24px] relative z-10">
        <div className="mb-6">
          <h1 className="font-playfair italic font-black text-[28px] text-charcoal leading-tight mb-2">
            {property.title}
          </h1>
          <div className="flex items-center gap-1.5 text-muted mb-4">
            <MapPin size={14} className="text-terra" />
            <span className="text-[13px]">{property.address}</span>
          </div>
          <KoboDisplay kobo={property.priceYearlyKobo} size="display" />
        </div>

        {/* Trust Chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          <VerifiedBadge type="title_confirmed" />
          <VerifiedBadge type="agent_verified" body="LASRERA" />
          <div className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-badge border border-blue-200 text-[11px] font-mono font-bold flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Escrow Eligible
          </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-3 border border-outline-variant rounded-card overflow-hidden bg-white mb-8">
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
            <Maximize2 size={18} className="text-muted mb-2" />
            <span className="text-[10px] font-mono uppercase text-muted mb-1">Area</span>
            <span className="text-sm font-bold text-charcoal">{property.areaSqm} sqm</span>
          </div>
        </div>

        {/* Description */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-6 bg-terra-dark rounded-full" />
            <h3 className="font-playfair font-bold text-lg text-charcoal uppercase tracking-wide">Property Description</h3>
          </div>
          <p className="text-sm text-muted leading-7 font-sans">
            {property.description}
          </p>
        </section>

        {/* Amenities */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-6 bg-terra-dark rounded-full" />
            <h3 className="font-playfair font-bold text-lg text-charcoal uppercase tracking-wide">Premium Amenities</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {property.amenities.map(amenity => (
              <div key={amenity} className="flex items-center gap-3 p-3 bg-white border border-outline-variant rounded-[12px]">
                <div className="w-8 h-8 rounded-full bg-sand flex items-center justify-center text-terra-dark">
                   <ShieldCheck size={16} /> {/* Placeholder icon */}
                </div>
                <span className="text-xs font-bold text-charcoal">{amenity}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Reviews */}
        <section className="mb-8">
          <div className="flex justify-between items-end mb-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-terra-dark rounded-full" />
              <h3 className="font-playfair font-bold text-lg text-charcoal uppercase tracking-wide">Reviews ({property.reviewCount})</h3>
            </div>
            <button 
              onClick={() => router.push(`/property/${propertyId}/reviews`)}
              className="text-terra font-bold text-xs flex items-center gap-1"
            >
              View all <ChevronRight size={14} />
            </button>
          </div>
          
          <div className="bg-white border border-outline-variant rounded-card p-5 mb-4 flex items-center gap-8">
            <div className="text-center">
              <div className="text-4xl font-playfair font-black text-charcoal mb-1">{property.rating}</div>
              <StarRating rating={property.rating || 0} size="sm" />
              <div className="text-[10px] text-muted mt-2 font-mono uppercase">{property.reviewCount} Reviews</div>
            </div>
            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map(star => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-muted w-3">{star}</span>
                  <div className="flex-1 h-1.5 bg-sand rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-400 rounded-full" 
                      style={{ width: star === 5 ? '80%' : star === 4 ? '15%' : '5%' }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {mockReviews.slice(0, 1).map(review => (
              <ReviewCard key={review.id} {...review} onMarkHelpful={() => {}} />
            ))}
          </div>
        </section>

        {/* Agent */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-6 bg-terra-dark rounded-full" />
            <h3 className="font-playfair font-bold text-lg text-charcoal uppercase tracking-wide">The Agent</h3>
          </div>
          <AgentCard {...agent} variant="compact" onMessage={() => {}} />
        </section>

        {/* Location */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-6 bg-terra-dark rounded-full" />
            <h3 className="font-playfair font-bold text-lg text-charcoal uppercase tracking-wide">Location</h3>
          </div>
          <div className="h-[140px] w-full rounded-[14px] bg-sand-deep border border-outline-variant relative flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#3D3020 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-terra-dark rounded-full flex items-center justify-center text-white shadow-lg animate-bounce">
                <MapPin size={24} />
              </div>
              <span className="text-[10px] font-mono font-bold text-charcoal uppercase tracking-widest">{property.lga}, Lagos</span>
            </div>
          </div>
        </section>
      </div>

      {/* Sticky CTA Strip */}
      <div className="fixed bottom-0 left-0 right-0 z-50 max-w-[430px] mx-auto bg-white/80 backdrop-blur-lg border-t border-outline-variant p-4 flex gap-3">
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
