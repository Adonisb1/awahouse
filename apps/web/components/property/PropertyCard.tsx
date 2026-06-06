'use client';

import Link from 'next/link';
import { Bed, Bath, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { BadgeDisplay } from '@/components/verification/BadgeDisplay';

type PropertyCardProps = {
  property: {
    id: string;
    title: string;
    address?: string | null;
    lga?: string | null;
    type: string;
    bedrooms: number;
    bathrooms: number;
    priceKobo: bigint;
    verificationBadge: 'pending' | 'agent_verified' | 'title_confirmed' | 'fully_verified';
    images?: Array<{ signedUrl?: string | null; url: string }>;
    owner?: { firstName?: string | null; lastName?: string | null };
  };
};

export function PropertyCard({ property }: PropertyCardProps) {
  const heroImage = property.images?.[0]?.signedUrl ?? property.images?.[0]?.url ?? null;
  const price = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(Number(property.priceKobo) / 100);

  return (
    <Link href={`/property/${property.id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5">
        <div className="relative aspect-[4/3] bg-surface-warm overflow-hidden">
          {heroImage ? (
            <img
              src={heroImage}
              alt={property.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-body text-charcoal/20 text-sm">
              No image
            </div>
          )}
          <div className="absolute top-3 left-3">
            <BadgeDisplay badge={property.verificationBadge} size="sm" />
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-display text-lg font-bold text-charcoal truncate">{property.title}</h3>
          <p className="mt-1 font-body text-sm text-charcoal/60 flex items-center gap-1">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            {property.lga ?? property.address ?? 'Lagos'}
          </p>
          <div className="mt-3 flex items-center gap-4 font-body text-sm text-charcoal/70">
            <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" />{property.bedrooms}</span>
            <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" />{property.bathrooms}</span>
            <span className="ml-auto font-display font-bold text-primary">{price}/yr</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
