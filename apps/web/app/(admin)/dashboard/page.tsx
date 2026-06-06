'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const STUB_VERIFICATIONS = [
  { id: '1', type: 'Agent NIN', userName: 'Tunde Balogun', date: '1 hour ago' },
  { id: '2', type: 'Property Title', userName: 'Chioma Eze', propertyTitle: '3-Bed in Magodo', date: '3 hours ago' },
];

const STUB_DISPUTES = [
  { id: '1', escrowRef: 'AWA-3F2A1B', tenant: 'Ada Obi', landlord: 'Emeka Okafor', reason: 'Property condition differs from listing', date: '2 days ago' },
];

export default function AdminDashboardPage() {
  const [activeTab] = useState<'overview' | 'verifications' | 'disputes'>('overview');

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6">
        <h1 className="font-display text-3xl italic font-black text-charcoal">Admin Dashboard</h1>
        <p className="font-body text-charcoal/60">Operations &amp; verification management</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card><CardContent className="pt-6"><p className="font-body text-sm text-charcoal/60">Total Escrows</p><p className="font-display text-2xl font-bold">0</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="font-body text-sm text-charcoal/60">Completed</p><p className="font-display text-2xl font-bold">0</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="font-body text-sm text-charcoal/60">Pending Verifications</p><p className="font-display text-2xl font-bold">{STUB_VERIFICATIONS.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="font-body text-sm text-charcoal/60">Revenue</p><p className="font-display text-2xl font-bold">₦0</p></CardContent></Card>
      </div>

      <div className="flex gap-2 mb-6">
        <Button variant={activeTab === 'overview' ? 'primary' : 'outline'} size="sm">Overview</Button>
        <Button variant={activeTab === 'verifications' ? 'primary' : 'outline'} size="sm">Verifications</Button>
        <Button variant={activeTab === 'disputes' ? 'primary' : 'outline'} size="sm">Disputes</Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="font-display text-xl font-bold text-charcoal mb-4">Pending Verifications</h2>
          <div className="flex flex-col gap-3">
            {STUB_VERIFICATIONS.map((v) => (
              <div key={v.id} className="flex items-center justify-between border-b border-surface-warm pb-3 last:border-0">
                <div>
                  <p className="font-body font-semibold text-charcoal">{v.type} — {v.userName}</p>
                  <p className="font-body text-sm text-charcoal/40">{v.propertyTitle ?? ''} &middot; {v.date}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Review</Button>
                  <Badge variant="pending">Pending</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h2 className="font-display text-xl font-bold text-charcoal mb-4">Open Disputes</h2>
          <div className="flex flex-col gap-3">
            {STUB_DISPUTES.map((d) => (
              <div key={d.id} className="flex items-center justify-between border-b border-surface-warm pb-3 last:border-0">
                <div>
                  <p className="font-body font-semibold text-charcoal">{d.escrowRef}</p>
                  <p className="font-body text-sm text-charcoal/60">{d.tenant} vs {d.landlord}</p>
                  <p className="font-body text-sm text-charcoal/40">{d.reason}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Resolve</Button>
                  <Badge variant="pending">Disputed</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
