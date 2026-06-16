'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { User, MessageSquare, Phone, Mail } from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';
import { EscrowStatusChip, EscrowStatus } from '@/components/escrow/EscrowStatusChip';
import { Button } from '@/components/ui/Button';
import { trpc } from '@/lib/trpc/react';

export default function TenantsPage() {
  const router = useRouter();
  const { data: tenants, isLoading } = trpc.escrow.getLandlordTenants.useQuery();

  return (
    <div className="min-h-screen bg-sand">
      <TopNav variant="back" title="Manage Tenants" />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="font-playfair text-2xl font-bold text-charcoal mb-6">Active Tenancies</h2>

        {isLoading ? (
            <div className="space-y-4">
                {[1, 2].map(i => <div key={i} className="h-24 bg-white rounded-card animate-pulse" />)}
            </div>
        ) : tenants && tenants.length > 0 ? (
            <div className="space-y-4">
                {tenants.map((item) => (
                    <div key={item.tenant.id} className="bg-white border border-outline-variant rounded-card p-5 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-full bg-sand flex items-center justify-center text-muted shrink-0">
                                    {item.tenant.avatarUrl ? (
                                        <img src={item.tenant.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <User size={24} />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-charcoal text-base">
                                        {item.tenant.firstName} {item.tenant.lastName}
                                    </h4>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                                        {item.tenant.email && (
                                            <span className="flex items-center gap-1">
                                                <Mail size={12} /> {item.tenant.email}
                                            </span>
                                        )}
                                        {item.tenant.phone && (
                                            <span className="flex items-center gap-1">
                                                <Phone size={12} /> {item.tenant.phone}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {item.properties.map((p) => (
                                            <div
                                                key={p.escrowId}
                                                className="flex items-center gap-2 bg-sand px-3 py-1.5 rounded-lg cursor-pointer hover:bg-sand-warm transition-colors"
                                                onClick={() => router.push(`/landlord/escrow/${p.escrowId}`)}
                                            >
                                                <span className="text-sm font-medium text-charcoal">{p.title}</span>
                                                <EscrowStatusChip status={p.status as EscrowStatus} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                {item.tenant.phone && (
                                    <a href={`tel:${item.tenant.phone}`}>
                                        <Button variant="secondary" size="sm">
                                            <Phone size={14} className="mr-1" /> Call
                                        </Button>
                                    </a>
                                )}
                                <Button variant="ghost" size="sm" className="text-terra">
                                    <MessageSquare size={14} className="mr-1" /> Message
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-12 text-muted">No active tenancies found.</div>
        )}
      </div>
    </div>
  );
}
