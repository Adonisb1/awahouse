'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, Bell, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { TopNav } from '@/components/layout/TopNav';
import { KoboDisplay } from '@/components/ui/KoboDisplay';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { EscrowStatusChip } from '@/components/escrow/EscrowStatusChip';
import { Button } from '@/components/ui/Button';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { InstalmentSummary } from '@/components/dashboard/InstalmentSummary';
import { trpc } from '@/lib/trpc/react';
import { mockUser } from '@/lib/mock';

export function LandlordDashboardView() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: properties, isLoading } = trpc.properties.listMyProperties.useQuery();
  const { data: payouts } = trpc.escrow.listPayouts.useQuery();
  const deleteMutation = trpc.properties.delete.useMutation({
    onSuccess: () => utils.properties.listMyProperties.invalidate(),
  });

  const handleDelete = (propertyId: string) => {
    if (confirm('Are you sure you want to delete this listing?')) {
        deleteMutation.mutate({ propertyId });
    }
  };

  return (
    <div className="min-h-screen bg-sand">
      <TopNav
        variant="brand"
        actions={
          <div className="flex gap-2">
            <NotificationBell />
            <button className="w-10 h-10 rounded-full bg-white border border-outline-variant flex items-center justify-center text-muted">
              <UserIcon size={20} />
            </button>
          </div>
        }
      />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[13px] text-muted mb-1">Good morning, Chief 👋</p>
          <div className="flex items-center gap-2">
            <h2 className="font-playfair text-3xl font-bold text-charcoal">
              {mockUser.name}
            </h2>
            <VerifiedBadge type="nin_verified" size="md" />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Listings', value: properties?.length ?? '0' },
            { label: 'Active Escrows', value: '1' },
            { label: 'Total Payout', value: '₦2.5M' },
            { label: 'Rating', value: '4.8' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-outline-variant rounded-card p-6 shadow-sm">
              <div className="font-mono text-xs uppercase text-muted tracking-widest mb-2">{stat.label}</div>
              <div className="font-playfair text-3xl font-bold text-terra-dark">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Active Escrows */}
          <section className="md:col-span-1 space-y-8">
            <h3 className="font-playfair text-xl font-bold text-charcoal mb-4">Active Escrows</h3>
            <div className="bg-white border border-outline-variant rounded-card p-5 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-charcoal text-sm mb-0.5">3-Bed Flat, Lekki</h4>
                  <p className="text-xs text-muted">Tenant: Martins A.</p>
                </div>
                <EscrowStatusChip status="KEY_HANDOVER_PENDING" />
              </div>
              <div className="flex justify-between items-end mt-4">
                <KoboDisplay kobo={250000000} size="md" color="terra" />
                <p className="text-xs text-muted font-mono">3 days left</p>
              </div>
            </div>
            
            <InstalmentSummary escrowId="escrow-001" />
          </section>

          {/* My Listings */}
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
            
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2].map(i => <div key={i} className="h-24 bg-white rounded-card animate-pulse" />)}
                </div>
            ) : properties && properties.length > 0 ? (
                <div className="space-y-4">
                    {properties.map((prop) => (
                        <div key={prop.id} className="bg-white border border-outline-variant rounded-card p-4 flex gap-4 shadow-sm hover:border-terra transition-colors">
                        <div className="w-20 h-20 rounded-xl bg-sand-warm overflow-hidden shrink-0">
                            {prop.images?.[0] ? (
                                <img src={prop.images[0]} alt={prop.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-terra/10 to-terra/5 flex items-center justify-center text-terra/30 font-playfair italic text-xl">A</div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h4 className="font-bold text-charcoal text-base truncate mb-1">{prop.title}</h4>
                            <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-mono text-muted uppercase">{prop.lga}</span>
                            <VerifiedBadge type={prop.verificationStatus === 'VERIFIED' ? 'fully_verified' : 'pending'} size="sm" />
                            </div>
                            <div className="flex justify-between items-center">
                            <span className="text-xs font-mono text-muted">0 views</span>
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
                <div className="text-center py-10 text-muted">No listings found.</div>
            )}
          </section>
        </div>

        {/* Recent Payouts */}
        <section className="mb-4 mt-8">
          <div className="flex justify-between items-end mb-4">
            <h3 className="font-playfair text-xl font-bold text-charcoal">Recent Payouts</h3>
          </div>
          <div className="bg-white border border-outline-variant rounded-card overflow-hidden shadow-sm">
            {payouts && payouts.length > 0 ? (
                payouts.map((payout) => (
                    <div key={payout.id} className="p-4 border-b border-outline-variant/30 flex justify-between items-center last:border-0">
                      <div>
                        <p className="text-[10px] font-mono text-muted uppercase mb-0.5">
                            {new Date(payout.createdAt).toLocaleDateString()} · {payout.propertyTitle}
                        </p>
                        <div className="font-mono text-sm font-bold text-charcoal">
                            <KoboDisplay kobo={Number(payout.amountKobo)} size="md" color="charcoal" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", payout.status === 'COMPLETED' ? 'bg-success' : 'bg-amber-400')} />
                        <span className={cn("text-[10px] font-mono font-bold uppercase", payout.status === 'COMPLETED' ? 'text-success' : 'text-amber-600')}>
                            {payout.status}
                        </span>
                      </div>
                    </div>
                ))
            ) : (
                <div className="p-4 text-center text-muted text-sm">No payouts found.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
