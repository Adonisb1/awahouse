'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { User, MessageSquare, ChevronRight, Phone, Mail } from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';
import { Button } from '@/components/ui/Button';
import { trpc } from '@/lib/trpc/react';

export default function TenantsPage() {
  const router = useRouter();
  const { data: result, isLoading } = trpc.escrow.list.useQuery({ status: 'funds_held' });
  const escrows = result?.items ?? [];

  return (
    <div className="min-h-screen bg-sand">
      <TopNav variant="back" title="Manage Tenants" />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="font-playfair text-2xl font-bold text-charcoal mb-6">Active Tenancies</h2>

        {isLoading ? (
            <div className="space-y-4">
                {[1, 2].map(i => <div key={i} className="h-24 bg-white rounded-card animate-pulse" />)}
            </div>
        ) : escrows.length > 0 ? (
            <div className="space-y-4">
                {escrows.map((t) => (
                    <div key={t.id} className="bg-white border border-outline-variant rounded-card p-5 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-full bg-sand flex items-center justify-center text-muted">
                                    <User size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-charcoal text-base">{t.property.title}</h4>
                                    <p className="text-xs text-muted">Active tenancy · {t.property.lga}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" className="text-terra">
                                <MessageSquare size={16} className="mr-2" /> Message
                            </Button>
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
