'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { trpc } from '@/lib/trpc/react';

export default function LandlordListingsPage() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [error, setError] = React.useState('');
  const { data: result, isLoading } = trpc.properties.listMyProperties.useQuery();
  const deleteMutation = trpc.properties.delete.useMutation({
    onSuccess: () => utils.properties.listMyProperties.invalidate(),
    onError: (err) => setError(err.message),
  });
  const listings = result?.properties ?? [];

  const handleDelete = (id: string) => {
    if (confirm('Delete this listing?')) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="min-h-screen bg-sand">
      <TopNav variant="back" title="My Listings" />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-playfair text-2xl font-bold text-charcoal">My Listings</h1>
            <p className="text-sm text-muted">Manage your properties</p>
          </div>
          <Button className="gap-2" onClick={() => router.push('/landlord/listings/new')}>
            <Plus className="h-4 w-4" /> New listing
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          {isLoading ? (
            [1, 2].map((i) => (
              <div key={i} className="h-24 bg-white rounded-card animate-pulse" />
            ))
          ) : listings.length > 0 ? (
            listings.map((listing) => (
              <Card key={listing.id}>
                <CardContent className="pt-6 flex items-center justify-between">
                  <div>
                    <h3 className="font-playfair text-lg font-bold text-charcoal">{listing.title}</h3>
                    <p className="text-sm text-muted">{listing.lga} &middot; ₦{Number(listing.priceKobo) / 100}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={listing.isAvailable ? 'fully_verified' : 'pending'}>
                      {listing.isAvailable ? 'Active' : 'Inactive'}
                    </Badge>
                    <button
                      className="p-2 text-muted hover:text-terra transition-colors"
                      onClick={() => router.push(`/landlord/listings/${listing.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      className="p-2 text-muted hover:text-red-500 transition-colors"
                      onClick={() => handleDelete(listing.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="py-12 text-center text-muted">
              <p className="font-bold text-sm">No listings yet.</p>
              <p className="text-xs mt-1">Create your first listing to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
