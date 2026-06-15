'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, User as UserIcon, ArrowRight, CheckCircle2, Users } from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';
import { BottomNav } from '@/components/layout/BottomNav';
import { KoboDisplay } from '@/components/ui/KoboDisplay';
import { EscrowStatusChip } from '@/components/escrow/EscrowStatusChip';
import { Button } from '@/components/ui/Button';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { VerificationBanner } from '@/components/dashboard/VerificationBanner';
import { trpc } from '@/lib/trpc/react';

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
    <div className="flex flex-col min-h-screen bg-sand">
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

      <div className="flex-1 overflow-y-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <VerificationBanner status={verificationStatus} />

        <div className="mb-8">
          <p className="text-[13px] text-muted mb-1">Good morning</p>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-2xl font-bold text-charcoal leading-tight">
              {userName}
            </h2>
            {stats && stats.avgRating && (
              <span className="bg-terra-50 text-terra-dark text-[10px] font-mono px-2 py-0.5 rounded-badge border border-terra/10 font-bold uppercase">
                ★ {stats.avgRating.toFixed(1)}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-8">
          <div className="bg-white border border-outline-variant rounded-card p-4 text-center shadow-sm">
            <div className="font-mono text-sm font-bold text-terra-dark mb-1">
              {stats ? stats.listingsCount : '..'}
            </div>
            <div className="font-mono text-[9px] uppercase text-muted tracking-tighter">Listings</div>
          </div>
          <div className="bg-white border border-outline-variant rounded-card p-4 text-center shadow-sm">
            <div className="font-mono text-sm font-bold text-terra-dark mb-1">
              {stats ? stats.activeEscrows : '..'}
            </div>
            <div className="font-mono text-[9px] uppercase text-muted tracking-tighter">Active</div>
          </div>
          <button
            onClick={() => router.push('/agent/commission')}
            className="bg-white border border-outline-variant rounded-card p-4 text-center shadow-sm hover:border-terra transition-colors"
          >
            <div className="font-mono text-sm font-bold text-terra-dark mb-1">
              {stats ? <KoboDisplay kobo={Number(stats.totalCommissionKobo)} size="sm" /> : '..'}
            </div>
            <div className="font-mono text-[9px] uppercase text-muted tracking-tighter">Commission</div>
          </button>
          <div className="bg-white border border-outline-variant rounded-card p-4 text-center shadow-sm">
            <div className="font-mono text-sm font-bold text-terra-dark mb-1">
              {stats ? (stats.avgRating ? stats.avgRating.toFixed(1) : '—') : '..'}
            </div>
            <div className="font-mono text-[9px] uppercase text-muted tracking-tighter">Rating</div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <section className="md:col-span-1 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-charcoal">Active Escrows</h3>
              {activeEscrows.length > 0 && (
                <Button size="sm" variant="ghost" onClick={() => router.push('/escrow')}>
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
                    onClick={() => router.push(`/escrow/${e.id}`)}
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

            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-charcoal">Recent Clients</h3>
              {recentCompleted.length > 0 && (
                <Button size="sm" variant="ghost" onClick={() => router.push('/agent/clients')}>
                  View all <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
            {recentCompleted.length > 0 ? (
              <div className="space-y-3">
                {recentCompleted.slice(0, 3).map((e) => (
                  <div key={e.id} className="bg-white border border-outline-variant rounded-card p-4 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center text-muted shrink-0">
                      <Users size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-charcoal text-sm truncate">
                        {e.property.title}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted truncate">{e.property.lga}</span>
                        <div className="flex items-center gap-1 text-[10px] text-success font-bold uppercase tracking-wider">
                          <CheckCircle2 size={10} /> Done
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-outline-variant rounded-card p-5 shadow-sm text-center text-muted text-sm py-10">
                No completed escrows yet.
              </div>
            )}
          </section>

          <section className="md:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-lg font-bold text-charcoal">My Listings</h3>
              <Button
                variant="primary"
                size="md"
                className="gap-2"
                onClick={() => router.push('/agent/listings/create')}
              >
                <Plus size={16} /> Add Listing
              </Button>
            </div>

            {listingsLoading ? (
              <div className="space-y-4">
                {[1, 2].map(i => <div key={i} className="h-24 bg-white rounded-card animate-pulse shadow-sm" />)}
              </div>
            ) : properties.length > 0 ? (
              <div className="space-y-4">
                {properties.slice(0, 5).map((prop) => (
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
                            onClick={() => router.push(`/agent/listings/${prop.id}/edit`)}
                          >
                            <Edit2 size={14} />
                          </Button>
                          {!prop.images?.[0] && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(prop.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          )}
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
      <BottomNav role="AGENT" />
    </div>
  );
}
