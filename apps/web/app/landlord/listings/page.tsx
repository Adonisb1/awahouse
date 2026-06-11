'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const STUB_LISTINGS = [
  { id: '1', title: 'Modern 3-Bedroom Apartment', lga: 'Ikeja', status: 'verified', price: '₦2,500,000' },
  { id: '2', title: 'Luxury 4-Bedroom Duplex', lga: 'Lekki', status: 'pending', price: '₦5,000,000' },
];

export default function LandlordListingsPage() {
  const router = useRouter();
  const userListings = useMemo(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('awa-listings');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }, []);
  const allListings = useMemo(() => {
    const userItems = userListings.map((l: Record<string, unknown>) => ({
      ...l,
      _isUserListing: true,
    }));
    return [...userItems, ...STUB_LISTINGS];
  }, [userListings]);

  function formatPrice(listing: Record<string, unknown>): string {
    if (listing.priceKobo) {
      const naira = Number(listing.priceKobo) / 100;
      return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(naira);
    }
    return listing.price as string ?? '';
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl italic font-black text-charcoal">My Listings</h1>
          <p className="font-body text-charcoal/60">Manage your properties</p>
        </div>
        <Button className="gap-2" onClick={() => router.push('/landlord/listings/new')}>
          <Plus className="h-4 w-4" /> New listing
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {allListings.map((listing: Record<string, unknown>) => (
          <Card key={listing.id as string}>
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-charcoal">{listing.title as string}</h3>
                <p className="font-body text-sm text-charcoal/60">{listing.lga as string} &middot; {formatPrice(listing)}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={listing.status === 'verified' ? 'fully_verified' : 'pending'}>
                  {listing.status === 'verified' ? 'Verified' : 'Pending'}
                </Badge>
                <button className="p-2 text-charcoal/40 hover:text-primary transition-colors">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="p-2 text-charcoal/40 hover:text-red-500 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
        {allListings.length === 0 && (
          <p className="py-12 text-center font-body text-charcoal/40">No listings yet.</p>
        )}
      </div>
    </div>
  );
}
