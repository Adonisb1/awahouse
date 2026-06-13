'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShieldCheck, Info, User as UserIcon, AlertCircle } from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';
import { KoboDisplay } from '@/components/ui/KoboDisplay';
import { EscrowStatusChip } from '@/components/escrow/EscrowStatusChip';
import { Button } from '@/components/ui/Button';
import { trpc } from '@/lib/trpc/react';
import { NotificationBell } from '@/components/layout/NotificationBell';

export default function LandlordEscrowPage() {
  const params = useParams();
  const escrowId = params.id as string;
  
  const { data: transaction, isLoading } = trpc.escrow.getById.useQuery({ id: escrowId });
  
  if (isLoading) return <div className="min-h-screen bg-sand p-8 text-center">Loading...</div>;
  if (!transaction) return <div className="min-h-screen bg-sand p-8 text-center">Transaction not found.</div>;

  return (
    <div className="min-h-screen bg-sand pb-8">
      <TopNav variant="back" title="Escrow Overview" />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-playfair text-2xl font-bold text-charcoal">Transaction Details</h1>
          <EscrowStatusChip status={transaction.status} />
        </div>

        <div className="bg-white border border-outline-variant rounded-card p-6 shadow-sm mb-8">
            <div className="flex justify-between items-center mb-6">
                <h4 className="font-bold text-charcoal">{transaction.property.title}</h4>
                <KoboDisplay kobo={Number(transaction.amountKobo)} size="lg" color="terra" />
            </div>

            <div className="space-y-4 text-sm text-muted">
                <div className="flex justify-between"><span>Tenant:</span> <span className="font-bold text-charcoal">{transaction.tenant.firstName} {transaction.tenant.lastName}</span></div>
                <div className="flex justify-between"><span>Status:</span> <EscrowStatusChip status={transaction.status} /></div>
                <div className="flex justify-between"><span>Created:</span> <span>{new Date(transaction.createdAt).toLocaleDateString()}</span></div>
            </div>
        </div>

        {transaction.status === 'disputed' && (
            <div className="bg-red-50 border border-red-200 rounded-card p-5 mb-8 flex gap-4">
                <AlertCircle className="text-red-600 shrink-0" size={24} />
                <div>
                    <h4 className="font-bold text-red-900">Transaction Disputed</h4>
                    <p className="text-sm text-red-800">Funds are currently frozen while our support team investigates the claim.</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
