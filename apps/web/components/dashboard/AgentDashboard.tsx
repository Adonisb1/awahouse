'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, User as UserIcon, ArrowRight, CheckCircle2, Users, Building, Wallet, TrendingUp, Star } from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';
import { BottomNav } from '@/components/layout/BottomNav';
import { KoboDisplay } from '@/components/ui/KoboDisplay';
import { EscrowStatusChip, EscrowStatus } from '@/components/escrow/EscrowStatusChip';
import { Button } from '@/components/ui/Button';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { VerificationBanner } from '@/components/dashboard/VerificationBanner';
import { trpc } from '@/lib/trpc/react';
import Link from 'next/link';

export function AgentDashboardView() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [error, setError] = React.useState('');

  const { data: stats } = trpc.agent.getDashboardStats.useQuery();
  const { data: result, isLoading: listingsLoading } = trpc.properties.listMyProperties.useQuery();
  const { data: escrowsData } = trpc.escrow.list.useQuery({ limit: 10 });
  const { data: profile } = trpc.auth.getProfile.useQuery();
  const { data: verifications } = trpc.verification.checkStatus.useQuery();

  const properties = result?.properties ?? [];
  const escrows = escrowsData?.items ?? [];
  const activeEscrows = escrows.filter(e => !['completed', 'refunded', 'cancelled'].includes(e.status));
  const recentCompleted = escrows.filter(e => e.status === 'completed');

  const deleteMutation = trpc.properties.delete.useMutation({
    onSuccess: () => utils.properties.listMyProperties.invalidate(),
    onError: (err) => setError(err.message),
  });

  const handleDelete = (propertyId: string) => {
    if (confirm('Are you sure you want to delete this listing?')) {
      deleteMutation.mutate({ id: propertyId });
    }
  };

  const userName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName ?? ''}`
    : 'Agent';

  const hasNinApproved = verifications?.verifications?.some(
    (v: { type: string; status: string }) => v.type === 'nin' && v.status === 'approved',
  );
  const verificationStatus = hasNinApproved ? 'verified' : 'pending';

  return (
    <div className="min-h-screen bg-sand pb-[80px]">
      <TopNav
        variant="brand"
        actions={
          <div className="flex items-center gap-3">
            <NotificationBell />
            <Link 
              href="/agent/profile"
              className="w-10 h-10 rounded-full bg-white border border-outline-variant flex items-center justify-center hover:bg-sand-warm transition-colors"
            >
              <UserIcon size={20} className="text-muted" />
            </Link>
          </div>
        }
      />

      <div className="max-w-6xl mx-auto px-4 py-8 lg:px-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <VerificationBanner status={verificationStatus} />

        <div className="mb-8">
          <p className="text-[13px] text-muted mb-1">Good morning</p>
          <div className="flex items-center gap-2">
            <h2 className="font-playfair text-2xl font-bold text-charcoal leading-tight">
              {userName}
            </h2>
            {stats && stats.avgRating && (
              <span className="bg-terra-50 text-terra-dark text-[10px] font-mono px-2 py-0.5 rounded-badge border border-terra/10 font-bold uppercase">
                ★ {stats.avgRating.toFixed(1)}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div className="bg-white border border-outline-variant rounded-card p-6 shadow-sm flex flex-col justify-center min-h-[120px]">
            <div className="font-mono text-[10px] uppercase text-muted tracking-widest mb-2">Listings</div>
            <div className="font-playfair text-4xl font-bold text-terra-dark">
              {listingsLoading ? '..' : properties.length}
            </div>
          </div>
          <div className="bg-white border border-outline-variant rounded-card p-6 shadow-sm flex flex-col justify-center min-h-[120px]">
            <div className="font-mono text-[10px] uppercase text-muted tracking-widest mb-2">Active Escrows</div>
            <div className="font-playfair text-4xl font-bold text-terra-dark">
              {escrowsData ? activeEscrows.length : '..'}
            </div>
          </div>
          <div className="bg-white border border-outline-variant rounded-card p-6 shadow-sm flex flex-col justify-center min-h-[120px]">
            <div className="font-mono text-[10px] uppercase text-muted tracking-widest mb-2">Commission</div>
            <div className="font-playfair text-3xl font-bold text-terra-dark truncate">
              {stats ? <KoboDisplay kobo={Number(stats.totalCommissionKobo)} size="sm" /> : '..'}
            </div>
          </div>
          <div className="bg-white border border-outline-variant rounded-card p-6 shadow-sm flex flex-col justify-center min-h-[120px]">
            <div className="font-mono text-[10px] uppercase text-muted tracking-widest mb-2">Rating</div>
            <div className="font-playfair text-4xl font-bold text-terra-dark">
              {stats ? (stats.avgRating ? stats.avgRating.toFixed(1) : '—') : '..'}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          <section className="lg:col-span-4 space-y-8">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-playfair text-xl font-bold text-charcoal">Active Escrows</h3>
              {activeEscrows.length > 0 && (
                <Button size="sm" variant="ghost" onClick={() => router.push('/agent/escrow')} className="text-xs font-bold text-terra">
                  View all <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              )}
            </div>
            {activeEscrows.length > 0 ? (
              <div className="space-y-4">
                {activeEscrows.slice(0, 3).map((e) => (
                  <div
                    key={e.id}
                    className="bg-white border border-outline-variant rounded-card p-5 shadow-sm cursor-pointer hover:border-terra transition-all group"
                    onClick={() => router.push(`/agent/escrow/${e.id}`)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <EscrowStatusChip status={e.status as EscrowStatus} />
                      <span className="text-[10px] font-mono text-muted uppercase">Ref: {e.id.split('-')[0]}</span>
                    </div>
                    <p className="font-bold text-base text-charcoal truncate mb-2 group-hover:text-terra transition-colors">{e.property.title}</p>
                    <KoboDisplay kobo={Number(e.amountKobo)} size="md" color="terra" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-outline-variant rounded-card p-8 shadow-sm text-center text-muted text-sm flex flex-col items-center justify-center min-h-[200px]">
                <div className="w-12 h-12 bg-sand rounded-full flex items-center justify-center mb-4">
                  <Wallet size={24} className="opacity-30" />
                </div>
                No active escrows yet.
              </div>
            )}

            <div className="flex items-center justify-between mt-8">
              <h3 className="font-playfair text-xl font-bold text-charcoal">Recent Clients</h3>
              {recentCompleted.length > 0 && (
                <Button size="sm" variant="ghost" onClick={() => router.push('/agent/clients')} className="text-xs font-bold text-terra">
                  View all <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              )}
            </div>
            {recentCompleted.length > 0 ? (
              <div className="space-y-4">
                {recentCompleted.slice(0, 3).map((e) => (
                  <div key={e.id} className="bg-white border border-outline-variant rounded-card p-5 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center text-muted shrink-0">
                      <Users size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-charcoal text-sm truncate">
                        {e.property.title}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted uppercase">{e.property.lga}</span>
                        <div className="flex items-center gap-1 text-[10px] text-success font-bold uppercase tracking-wider">
                          <CheckCircle2 size={10} /> Done
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-outline-variant rounded-card p-8 shadow-sm text-center text-muted text-sm flex flex-col items-center justify-center min-h-[150px]">
                No completed escrows yet.
              </div>
            )}
          </section>

          <section className="lg:col-span-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-playfair text-xl font-bold text-charcoal">My Listings</h3>
              <Button
                variant="primary"
                size="md"
                className="gap-2 px-6"
                onClick={() => router.push('/agent/listings/create')}
              >
                <Plus size={18} /> Add New Listing
              </Button>
            </div>
            
            {listingsLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-28 bg-white rounded-card animate-pulse shadow-sm" />)}
                </div>
            ) : properties.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                    {properties.map((prop) => (
                        <div key={prop.id} className="bg-white border border-outline-variant rounded-card p-4 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all">
                          <div className="flex gap-4">
                            <div className="w-20 h-20 rounded-xl bg-sand-warm overflow-hidden shrink-0 border border-outline-variant/20">
                                {prop.images?.[0] ? (
                                    <img src={prop.images[0].url} alt={prop.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-terra/10 to-terra/5 flex items-center justify-center text-terra/30 font-playfair italic text-xl">A</div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <h4 className="font-bold text-charcoal text-base truncate mb-1">{prop.title}</h4>
                                <p className="text-xs font-mono text-muted uppercase mb-2">{prop.lga}</p>
                                <div className="font-playfair font-bold text-terra-dark">
                                  <KoboDisplay kobo={Number(prop.priceKobo)} size="sm" />
                                </div>
                            </div>
                          </div>
                          <div className="flex gap-2 pt-2 border-t border-sand">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="flex-1 h-9 gap-2 bg-sand/30 hover:bg-sand/60 border-none text-xs font-bold"
                              onClick={() => router.push(`/agent/listings/${prop.id}/edit`)}
                            >
                              <Edit2 size={14} /> Edit Listing
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-12 h-9 p-0 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(prop.id)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white border border-outline-variant rounded-card p-12 text-center text-muted text-sm shadow-sm">
                  <div className="w-16 h-16 bg-sand rounded-full flex items-center justify-center mx-auto mb-6">
                    <Building size={32} className="opacity-20" />
                  </div>
                  <p className="max-w-[240px] mx-auto leading-relaxed">
                    No listings found. Create your first listing to start accepting clients.
                  </p>
                  <Button variant="secondary" className="mt-6" onClick={() => router.push('/agent/listings/create')}>Create Listing</Button>
                </div>
            )}
          </section>
        </div>
      </div>
      <BottomNav role="AGENT" />
    </div>
  );
}
