'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

const STATUS_BADGE: Record<string, 'fully_verified' | 'title_confirmed' | 'agent_verified' | 'pending'> = {
  pending_payment: 'pending',
  funds_held: 'pending',
  docs_verified: 'agent_verified',
  key_handover_pending: 'title_confirmed',
  completed: 'fully_verified',
  disputed: 'pending',
  refunded: 'pending',
  cancelled: 'pending',
};

const STATUS_LABEL: Record<string, string> = {
  pending_payment: 'Pending Payment',
  funds_held: 'Funds Held',
  docs_verified: 'Docs Verified',
  key_handover_pending: 'Awaiting Handover',
  completed: 'Completed',
  disputed: 'Disputed',
  refunded: 'Refunded',
  cancelled: 'Cancelled',
};

const STUB_ESCROWS = [
  { id: '1', propertyTitle: 'Modern 3-Bedroom Apartment', lga: 'Ikeja', status: 'key_handover_pending', amount: '₦2,500,000', createdAt: '2 days ago' },
  { id: '2', propertyTitle: 'Luxury 4-Bedroom Duplex', lga: 'Lekki', status: 'completed', amount: '₦5,000,000', createdAt: '2 weeks ago' },
  { id: '3', propertyTitle: 'Cozy Studio in Surulere', lga: 'Surulere', status: 'pending_payment', amount: '₦800,000', createdAt: '1 hour ago' },
];

export default function EscrowDashboardPage() {
  const [escrows] = useState(STUB_ESCROWS);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6">
        <h1 className="font-display text-3xl italic font-black text-charcoal">My Escrows</h1>
        <p className="font-body text-charcoal/60">Track your property transactions</p>
      </div>

      <div className="flex flex-col gap-3">
        {escrows.map((escrow) => (
          <Link key={escrow.id} href={`/escrow/${escrow.id}`}>
            <Card className="hover:shadow-card transition-shadow cursor-pointer">
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-charcoal">{escrow.propertyTitle}</h3>
                  <p className="font-body text-sm text-charcoal/60">{escrow.lga} &middot; {escrow.amount}</p>
                  <p className="font-body text-xs text-charcoal/40">{escrow.createdAt}</p>
                </div>
                <Badge variant={STATUS_BADGE[escrow.status] ?? 'pending'}>
                  {STATUS_LABEL[escrow.status] ?? escrow.status}
                </Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
