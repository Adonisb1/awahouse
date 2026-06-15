'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShieldCheck, TrendingUp, Heart, ArrowRight, User as UserIcon } from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';
import { KoboDisplay } from '@/components/ui/KoboDisplay';
import { EscrowStatusChip, EscrowStatus } from '@/components/escrow/EscrowStatusChip';
import { Button } from '@/components/ui/Button';
import { VerificationBanner } from '@/components/dashboard/VerificationBanner';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { trpc } from '@/lib/trpc/react';
import Link from 'next/link';

export function TenantDashboardView() {
  const router = useRouter();

  const { data: escrowsData, isLoading: escrowsLoading } = trpc.escrow.list.useQuery({ limit: 5 });
  const { data: scoreData } = trpc.rentScore.get.useQuery({});
  const { data: verifications } = trpc.verification.checkStatus.useQuery();
  const { data: savedData } = trpc.properties.getSavedProperties.useQuery();
  const { data: upcomingData } = trpc.rentInstalments.list.useQuery({ status: 'scheduled', limit: 3 });

  const escrows = escrowsData?.items ?? [];
  const activeEscrows = escrows.filter(e => !['completed', 'refunded', 'cancelled'].includes(e.status));
  const savedCount = savedData?.properties?.length ?? 0;
  const score = scoreData?.score ?? 500;
  const upcoming = upcomingData?.items ?? [];

  const totalPaid = escrows
    .filter(e => e.status === 'completed')
    .reduce((sum, e) => sum + Number(e.amountKobo), 0);

  const hasNinApproved = verifications?.verifications?.some(
    (v: any) => v.type === 'nin' && v.status === 'approved'
  );
  const verificationStatus = hasNinApproved ? 'verified' : 'pending';

  return (
    <div className="min-h-screen bg-sand">
      <TopNav
        variant="brand"
        actions={
          <div className="flex items-center gap-3">
            <NotificationBell />
            <Link 
              href="/profile"
              className="w-8 h-8 rounded-full bg-terra/10 flex items-center justify-center hover:bg-terra/20 transition-colors"
            >
              <UserIcon size={16} className="text-terra-dark" />
            </Link>
          </div>
        }
      />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <VerificationBanner status={verificationStatus} />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white border border-outline-variant rounded-card p-6 shadow-sm">
            <div className="font-mono text-xs uppercase text-muted tracking-widest mb-2">Active Escrows</div>
            <div className="font-playfair text-3xl font-bold text-terra-dark">
              {escrowsLoading ? '..' : activeEscrows.length}
            </div>
          </div>
          <div className="bg-white border border-outline-variant rounded-card p-6 shadow-sm">
            <div className="font-mono text-xs uppercase text-muted tracking-widest mb-2">Total Paid</div>
            <div className="font-playfair text-3xl font-bold text-terra-dark">
              {escrowsLoading ? '..' : <KoboDisplay kobo={totalPaid} size="sm" />}
            </div>
          </div>
          <div className="bg-white border border-outline-variant rounded-card p-6 shadow-sm">
            <div className="font-mono text-xs uppercase text-muted tracking-widest mb-2">RentScore</div>
            <div className="font-playfair text-3xl font-bold text-terra-dark">
              {scoreData ? score : '..'}
            </div>
          </div>
          <div className="bg-white border border-outline-variant rounded-card p-6 shadow-sm">
            <div className="font-mono text-xs uppercase text-muted tracking-widest mb-2">Saved</div>
            <div className="font-playfair text-3xl font-bold text-terra-dark">
              {savedData ? savedCount : '..'}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          <button
            onClick={() => router.push('/explore')}
            className="bg-white border border-outline-variant rounded-card p-4 shadow-sm flex flex-col items-center gap-2 hover:border-terra transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-terra/10 flex items-center justify-center text-terra">
              <Search size={20} />
            </div>
            <span className="text-xs font-bold text-charcoal">Explore</span>
          </button>
          <button
            onClick={() => router.push('/escrow')}
            className="bg-white border border-outline-variant rounded-card p-4 shadow-sm flex flex-col items-center gap-2 hover:border-terra transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-terra/10 flex items-center justify-center text-terra">
              <ShieldCheck size={20} />
            </div>
            <span className="text-xs font-bold text-charcoal">Escrows</span>
          </button>
          <button
            onClick={() => router.push('/rent-score')}
            className="bg-white border border-outline-variant rounded-card p-4 shadow-sm flex flex-col items-center gap-2 hover:border-terra transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-terra/10 flex items-center justify-center text-terra">
              <TrendingUp size={20} />
            </div>
            <span className="text-xs font-bold text-charcoal">Score</span>
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Active Escrows */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-playfair text-xl font-bold text-charcoal">Active Escrows</h3>
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
                      <EscrowStatusChip status={e.status as EscrowStatus} />
                    </div>
                    <KoboDisplay kobo={Number(e.amountKobo)} size="sm" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-outline-variant rounded-card p-5 shadow-sm text-center text-muted text-sm py-10">
                {escrowsLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map(i => <div key={i} className="h-16 bg-sand rounded-card animate-pulse" />)}
                  </div>
                ) : (
                  <>
                    No active escrows yet.
                    <br />
                    <button
                      onClick={() => router.push('/explore')}
                      className="text-terra font-bold mt-2 underline"
                    >
                      Explore properties
                    </button>
                  </>
                )}
              </div>
            )}
          </section>

          {/* Upcoming Instalments */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-playfair text-xl font-bold text-charcoal">Upcoming Instalments</h3>
              {upcoming.length > 0 && (
                <Button size="sm" variant="ghost" onClick={() => router.push('/rent-instalments')}>
                  View all <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
            {upcoming.length > 0 ? (
              <div className="space-y-3">
                {upcoming.map((inst) => (
                  <div
                    key={inst.id}
                    className="bg-white border border-outline-variant rounded-card p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-sm text-charcoal">
                        Instalment #{inst.instalmentNumber}
                      </p>
                      <span className="text-[10px] font-mono text-muted uppercase">
                        {new Date(inst.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <KoboDisplay kobo={Number(inst.amountKobo)} size="sm" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-outline-variant rounded-card p-5 shadow-sm text-center text-muted text-sm py-10">
                No upcoming instalments.
              </div>
            )}
          </section>
        </div>

        {/* Saved Properties */}
        {savedCount > 0 && (
          <section className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-playfair text-xl font-bold text-charcoal">Saved Properties</h3>
              <Button size="sm" variant="ghost" onClick={() => router.push('/explore')}>
                Browse <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {savedData?.properties?.slice(0, 5).map((p: any) => (
                <div
                  key={p.id}
                  className="bg-white border border-outline-variant rounded-card p-4 shadow-sm min-w-[180px] cursor-pointer hover:border-terra transition-colors"
                  onClick={() => router.push(`/property/${p.id}`)}
                >
                  <div className="w-full h-24 bg-sand-warm rounded-lg mb-2 overflow-hidden">
                    {p.images?.[0]?.url ? (
                      <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-terra/30">
                        <Heart size={24} />
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-bold text-charcoal truncate">{p.title}</p>
                  <p className="text-[10px] text-muted truncate">{p.lga}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
