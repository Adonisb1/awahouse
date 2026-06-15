'use client';

import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { KoboDisplay } from '@/components/ui/KoboDisplay';
import { TopNav } from '@/components/layout/TopNav';
import { BottomNav } from '@/components/layout/BottomNav';
import { trpc } from '@/lib/trpc/react';

export default function AgentListingsPage() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: result, isLoading } = trpc.properties.listMyProperties.useQuery();
  const deleteMutation = trpc.properties.delete.useMutation({
    onSuccess: () => utils.properties.listMyProperties.invalidate(),
  });

  const properties = result?.properties ?? [];

  const handleDelete = (id: string) => {
    if (confirm('Delete this listing?')) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-sand">
      <TopNav variant="back" title="Client Listings" onBack={() => router.push('/agent')} />

      <div className="flex-1 mx-auto max-w-4xl w-full px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl italic font-black text-charcoal">Client Listings</h1>
            <p className="font-body text-charcoal/60">Properties managed on behalf of landlords</p>
          </div>
          <Button className="gap-2" onClick={() => router.push('/agent/listings/create')}>
            <Plus className="h-4 w-4" /> New listing
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="h-20 bg-white rounded-card animate-pulse shadow-sm" />)}
          </div>
        ) : properties.length > 0 ? (
          <div className="flex flex-col gap-3">
            {properties.map((listing) => (
              <Card key={listing.id}>
                <CardContent className="pt-6 flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-lg font-bold text-charcoal">{listing.title}</h3>
                    <p className="font-body text-sm text-charcoal/60">
                      {listing.lga} &middot; <KoboDisplay kobo={Number(listing.priceKobo)} size="sm" />
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={listing.verificationBadge === 'agent_verified' ? 'agent_verified' : 'pending'}>
                      {listing.verificationBadge === 'agent_verified' ? 'Agent Verified' : 'Pending'}
                    </Badge>
                    <button
                      className="p-2 text-charcoal/40 hover:text-primary transition-colors"
                      onClick={() => router.push(`/agent/listings/${listing.id}/edit`)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      className="p-2 text-charcoal/40 hover:text-red-500 transition-colors"
                      onClick={() => handleDelete(listing.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-display text-xl font-bold text-charcoal mb-2">No listings yet</h2>
            <p className="text-sm text-charcoal/60 max-w-xs mb-6">
              Create your first client listing to get started.
            </p>
            <Button onClick={() => router.push('/agent/listings/create')}>
              Create Listing
            </Button>
          </div>
        )}
      </div>
      <BottomNav role="AGENT" />
    </div>
  );
}
