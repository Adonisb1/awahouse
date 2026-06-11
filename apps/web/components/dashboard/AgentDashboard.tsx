'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Bell, User as UserIcon, Plus, Edit2, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';
import { BottomNav } from '@/components/layout/BottomNav';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { Button } from '@/components/ui/Button';
import { mockAgents } from '@/lib/mock';
import { NotificationBell } from '@/components/layout/NotificationBell';

export function AgentDashboardView() {
  const router = useRouter();
  const agent = mockAgents[0]!;

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
        <div className="bg-amber-50 border border-amber-200 rounded-[14px] p-4 flex gap-3 mb-8">
          <Clock className="text-amber-600 shrink-0" size={20} />
          <p className="text-sm text-amber-800 leading-relaxed">
            <span className="font-bold">⏳ Professional cert under review.</span><br />
            Verification typically takes up to 48 hours.
          </p>
        </div>

        <div className="mb-8">
          <p className="text-[13px] text-muted mb-1">Good morning, Adebayo 👋</p>
          <div className="flex items-center gap-2">
            <h2 className="font-playfair text-2xl font-bold text-charcoal leading-tight">
              {agent.name}
            </h2>
            <div className="bg-terra-50 text-terra-dark text-[10px] font-mono px-2 py-0.5 rounded-badge border border-terra/10 font-bold uppercase">
              {agent.professionalBodies[0]!}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Listng', value: '12' },
            { label: 'Escrow', value: '124' },
            { label: 'Commis', value: '₦3.6M' },
            { label: 'Rat', value: '4.9' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-outline-variant rounded-[14px] p-3 text-center shadow-sm">
              <div className="font-mono text-sm font-bold text-terra-dark mb-1">{stat.value}</div>
              <div className="font-mono text-[9px] uppercase text-muted tracking-tighter">{stat.label}</div>
            </div>
          ))}
        </div>

        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-playfair text-lg font-bold text-charcoal">My Listings</h3>
            <Button variant="ghost" size="sm" disabled className="text-muted bg-gray-100 h-8 px-3 gap-1 cursor-not-allowed">
              <Plus size={14} /> Create
            </Button>
          </div>
          <div className="space-y-3">
            <div className="bg-white border border-outline-variant rounded-card p-3 flex gap-4 shadow-sm">
              <div className="w-16 h-16 rounded-xl bg-sand-warm overflow-hidden shrink-0">
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-400 font-playfair italic">AW</div>
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h4 className="font-bold text-charcoal text-sm truncate mb-1">Azure Waterfront</h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted uppercase">V.Island</span>
                  <VerifiedBadge type="fully_verified" size="sm" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h3 className="font-playfair text-lg font-bold text-charcoal mb-4">Recent Clients</h3>
          <div className="bg-white border border-outline-variant rounded-card overflow-hidden shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center text-muted shrink-0">
              <UserIcon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-charcoal text-sm truncate">Martins A.</h4>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted truncate">Lekki escrow</p>
                <div className="flex items-center gap-1 text-[10px] text-success font-bold uppercase tracking-wider">
                  <CheckCircle2 size={10} /> Done
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <BottomNav role="AGENT" />
    </div>
  );
}
