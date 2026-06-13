'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, User as UserIcon, ArrowRight } from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';
import { KoboDisplay } from '@/components/ui/KoboDisplay';
import { EscrowStatusChip } from '@/components/escrow/EscrowStatusChip';
import { Button } from '@/components/ui/Button';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { trpc } from '@/lib/trpc/react';
import { VerificationBanner } from '@/components/dashboard/VerificationBanner';

export function LandlordDashboardView() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [error, setError] = React.useState('');
  const { data: result, isLoading: listingsLoading } = trpc.properties.listMyProperties.useQuery();
  const { data: escrowsData } = trpc.escrow.list.useQuery({ limit: 5 });
  const { data: verifications } = trpc.verification.checkStatus.useQuery();

  const properties = result?.properties ?? [];
  const escrows = escrowsData?.items ?? [];
  const activeEscrows = escrows.filter(e => !['completed', 'refunded', 'cancelled'].includes(e.status));
  const totalPayout = escrows
    .filter(e => e.status === 'completed')
    .reduce((sum, e) => sum + Number(e.amountKobo) - Number(e.platformFeeKobo || 0n), 0);
  const hasNinApproved = verifications?.verifications?.some(v => v.type === 'nin' && v.status === 'approved');
  const verificationStatus = hasNinApproved ? 'verified' : 'pending';

  const deleteMutation = trpc.properties.delete.useMutation({
    onSuccess: () => utils.properties.listMyProperties.invalidate(),
    onError: (err) => setError(err.message),
  });

  const handleDelete = (propertyId: string) => {
    if (confirm('Are you sure you want to delete this listing?')) {
        deleteMutation.mutate({ id: propertyId });
    }
  };

  return (
    <div className="min-h-screen bg-sand">
      <TopNav
        variant="brand"
        actions={
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="w-8 h-8 rounded-full bg-terra/10 flex items-center justify-center">
              <UserIcon size={16} className="text-terra-dark" />
            </div>
          </div>
        }
      />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <VerificationBanner status={verificationStatus} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white border border-outline-variant rounded-card p-6 shadow-sm">
            <div className="font-mono text-xs uppercase text-muted tracking-widest mb-2">Total Listings</div>
            <div className="font-playfair text-3xl font-bold text-terra-dark">
              {listingsLoading ? '..' : properties.length}
            </div>
          </div>
          <div className="bg-white border border-outline-variant rounded-card p-6 shadow-sm">
            <div className="font-mono text-xs uppercase text-muted tracking-widest mb-2">Active Escrows</div>
            <div className="font-playfair text-3xl font-bold text-terra-dark">
              {escrowsData ? activeEscrows.length : '..'}
            </div>
          </div>
          <div className="bg-white border border-outline-variant rounded-card p-6 shadow-sm">
            <div className="font-mono text-xs uppercase text-muted tracking-widest mb-2">Total Payout</div>
            <div className="font-playfair text-3xl font-bold text-terra-dark">
              {escrowsData ? <KoboDisplay kobo={totalPayout} size="sm" /> : '..'}
            </div>
          </div>
          <div className="bg-white border border-outline-variant rounded-card p-6 shadow-sm">
            <div className="font-mono text-xs uppercase text-muted tracking-widest mb-2">Rating</div>
            <div className="font-playfair text-3xl font-bold text-terra-dark">&mdash;</div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <section className="md:col-span-1 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="font-playfair text-xl font-bold text-charcoal mb-4">Active Escrows</h3>
              {activeEscrows.length > 0 && (
                <Button size="sm" variant="ghost" onClick={() => router.push('/landlord/escrow')}>
                  View all <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
            {activeEscrows.length > 0 ? (
              <div className="space-y-3">
                {activeEscrows.slice(0, 3).map((e) => (
                  <div
                    key={e.id}
                    className="bg-white border border-outline-variant rounded-card p-4 shadow-sm cursor-pointer hover:border-terra transition-colors"
                    onClick={() => router.push(`/landlord/escrow/${e.id}`)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-sm text-charcoal truncate">{e.property.title}</p>
                      <EscrowStatusChip status={e.status as any} />
                    </div>
                    <KoboDisplay kobo={Number(e.amountKobo)} size="sm" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-outline-variant rounded-card p-5 shadow-sm text-center text-muted text-sm py-10">
                No active escrows yet.
              </div>
            )}
          </section>

          <section className="md:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-playfair text-xl font-bold text-charcoal">My Listings</h3>
              <Button
                variant="primary"
                size="md"
                className="gap-2"
                onClick={() => router.push('/landlord/listings/new')}
              >
                <Plus size={16} /> Add Listing
              </Button>
            </div>
            
            {listingsLoading ? (
                <div className="space-y-4">
                    {[1, 2].map(i => <div key={i} className="h-24 bg-white rounded-card animate-pulse" />)}
                </div>
            ) : properties.length > 0 ? (
                <div className="space-y-4">
                    {properties.map((prop) => (
                        <div key={prop.id} className="bg-white border border-outline-variant rounded-card p-4 flex gap-4 shadow-sm hover:border-terra transition-colors">
                        <div className="w-20 h-20 rounded-xl bg-sand-warm overflow-hidden shrink-0">
                            {prop.images?.[0] ? (
                                <img src={prop.images[0].url} alt={prop.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-terra/10 to-terra/5 flex items-center justify-center text-terra/30 font-playfair italic text-xl">A</div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h4 className="font-bold text-charcoal text-base truncate mb-1">{prop.title}</h4>
                            <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-mono text-muted uppercase">{prop.lga}</span>
                            </div>
                            <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 rounded-full"
                                  onClick={() => router.push(`/landlord/listings/${prop.id}/edit`)}
                                >
                                  <Edit2 size={14} />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => handleDelete(prop.id)}
                                >
                                  <Trash2 size={14} />
                                </Button>
                            </div>
                            </div>
                        </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white border border-outline-variant rounded-card p-10 text-center text-muted text-sm">
                  No listings found. Create your first listing to get started.
                </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
