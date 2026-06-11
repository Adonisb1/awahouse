'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, Bell, User as UserIcon } from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';
import { BottomNav } from '@/components/layout/BottomNav';
import { KoboDisplay } from '@/components/ui/KoboDisplay';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { EscrowStatusChip } from '@/components/escrow/EscrowStatusChip';
import { Button } from '@/components/ui/Button';
import { mockProperties, mockUser } from '@/lib/mock';
import { NotificationBell } from '@/components/layout/NotificationBell';

export function LandlordDashboardView() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-sand">
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

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mb-8">
          <p className="text-[13px] text-muted mb-1">Good morning, Chief 👋</p>
          <div className="flex items-center gap-2">
            <h2 className="font-playfair text-2xl font-bold text-charcoal leading-tight">
              {mockUser.name}
            </h2>
            <VerifiedBadge type="nin_verified" size="sm" />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Listng', value: '3' },
            { label: 'Escrow', value: '1' },
            { label: 'Payout', value: '₦2.5M' },
            { label: 'Rat', value: '4.8' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-outline-variant rounded-[14px] p-3 text-center shadow-sm">
              <div className="font-mono text-sm font-bold text-terra-dark mb-1">{stat.value}</div>
              <div className="font-mono text-[9px] uppercase text-muted tracking-tighter">{stat.label}</div>
            </div>
          ))}
        </div>

        <section className="mb-8">
          <h3 className="font-playfair text-lg font-bold text-charcoal mb-4">Active Escrows</h3>
          <div className="bg-white border border-outline-variant rounded-card p-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-bold text-charcoal text-sm mb-0.5">3-Bed Flat, Lekki</h4>
                <p className="text-xs text-muted">Tenant: Martins A.</p>
              </div>
              <EscrowStatusChip status="KEY_HANDOVER_PENDING" />
            </div>
            <div className="flex justify-between items-end">
              <KoboDisplay kobo={250000000} size="md" color="terra" />
              <p className="text-[11px] text-muted font-mono">3 days remaining</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-playfair text-lg font-bold text-charcoal">My Listings</h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-terra h-8 px-3 gap-1"
              onClick={() => router.push('/landlord/listings/new')}
            >
              <Plus size={14} /> Add New
            </Button>
          </div>
          <div className="space-y-3">
            {mockProperties.slice(0, 2).map((prop, index) => (
              <div key={prop.id} className="bg-white border border-outline-variant rounded-card p-3 flex gap-4 shadow-sm group">
                <div className="w-16 h-16 rounded-xl bg-sand-warm overflow-hidden shrink-0">
                  <div className="w-full h-full bg-gradient-to-br from-terra/10 to-terra/5 flex items-center justify-center text-terra/30 font-playfair italic">A</div>
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h4 className="font-bold text-charcoal text-sm truncate mb-1">{prop.title}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-muted uppercase">{prop.lga}</span>
                    <VerifiedBadge type={index === 0 ? 'fully_verified' : 'pending'} size="sm" />
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-[10px] font-mono text-muted uppercase">{index === 0 ? '143' : '0'} views</span>
                    <div className="flex gap-2">
                      <button className="p-1.5 rounded-full bg-sand text-muted hover:text-terra transition-colors"><Edit2 size={12} /></button>
                      <button className="p-1.5 rounded-full bg-sand text-muted hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <BottomNav role="LANDLORD" />
    </div>
  );
}
