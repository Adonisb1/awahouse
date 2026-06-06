'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Bed, Bath, MapPin, Home, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BadgeDisplay } from '@/components/verification/BadgeDisplay';
import { StarRating } from '@/components/reviews/StarRating';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { Card, CardContent } from '@/components/ui/Card';

const STUB_PROPERTY = {
  id: '1',
  title: 'Modern 3-Bedroom Apartment in Ikeja',
  description: 'A beautiful modern apartment in the heart of Ikeja. Close to shopping malls, restaurants, and public transportation. Features include air conditioning, 24/7 security, and dedicated parking space.',
  address: '42 Awolowo Road, Ikeja',
  lga: 'Ikeja',
  type: 'apartment',
  bedrooms: 3,
  bathrooms: 2,
  priceKobo: 250000000n,
  verificationBadge: 'fully_verified' as const,
  latitude: 6.6018,
  longitude: 3.3515,
  images: [],
  owner: { id: 'owner-1', firstName: 'Chidi', lastName: 'Okonkwo', role: 'landlord' },
};

const STUB_REVIEWS = [
  {
    id: 'r1', rating: 5, comment: 'Excellent property! The landlord was very responsive and the apartment exceeded my expectations.', isVerified: true, createdAt: new Date('2026-05-15'),
    reviewer: { firstName: 'Kelechi', lastName: 'Eze' },
  },
  {
    id: 'r2', rating: 4, comment: 'Great location and well-maintained. Would recommend.', isVerified: true, createdAt: new Date('2026-04-20'),
    reviewer: { firstName: 'Funmi', lastName: 'Adebayo' },
  },
];

export default function PropertyDetailPage() {
  const router = useRouter();
  const property = STUB_PROPERTY;

  const price = new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN', maximumFractionDigits: 0,
  }).format(Number(property.priceKobo) / 100);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-charcoal/60 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="relative aspect-[2/1] w-full rounded-xl bg-surface-warm overflow-hidden mb-6">
        <div className="flex h-full items-center justify-center font-body text-charcoal/20">
          <Home className="h-16 w-16" />
        </div>
        <div className="absolute top-4 left-4">
          <BadgeDisplay badge={property.verificationBadge} />
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <div className="flex-1">
          <h1 className="font-display text-3xl italic font-black text-charcoal">{property.title}</h1>
          <p className="mt-1 font-body text-charcoal/60 flex items-center gap-1">
            <MapPin className="h-4 w-4" />{property.address}, {property.lga}
          </p>

          <div className="mt-4 flex flex-wrap gap-4 font-body text-sm text-charcoal/70">
            <span className="flex items-center gap-1.5 bg-surface-warm rounded-lg px-3 py-1.5">
              <Bed className="h-4 w-4 text-primary" /> {property.bedrooms} Bedrooms
            </span>
            <span className="flex items-center gap-1.5 bg-surface-warm rounded-lg px-3 py-1.5">
              <Bath className="h-4 w-4 text-primary" /> {property.bathrooms} Bathrooms
            </span>
            <span className="flex items-center gap-1.5 bg-surface-warm rounded-lg px-3 py-1.5 capitalize">
              <Home className="h-4 w-4 text-primary" /> {property.type}
            </span>
          </div>

          <div className="mt-6">
            <h2 className="font-display text-xl font-bold text-charcoal mb-2">Description</h2>
            <p className="font-body text-charcoal/70 leading-relaxed">{property.description}</p>
          </div>

          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-display text-xl font-bold text-charcoal">Reviews</h2>
              <StarRating rating={4.5} size="sm" />
              <span className="font-body text-sm text-charcoal/40">(2 reviews)</span>
            </div>
            <div className="flex flex-col gap-3">
              {STUB_REVIEWS.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-80">
          <Card className="sticky top-20">
            <CardContent className="pt-6">
              <p className="font-display text-2xl font-black text-primary">{price}<span className="font-body text-sm font-normal text-charcoal/40">/year</span></p>
              <p className="mt-1 font-body text-sm text-charcoal/60">Owned by {property.owner.firstName} {property.owner.lastName}</p>
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-success-bg p-3">
                <Shield className="h-5 w-5 text-success flex-shrink-0" />
                <p className="font-body text-xs text-success">Escrow protected. Funds held securely until you confirm possession.</p>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <Button className="w-full">Inquire</Button>
                <Button variant="outline" className="w-full">Schedule viewing</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
