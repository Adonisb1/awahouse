'use client';

import { ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/layout/TopNav';
import { KoboDisplay } from '@/components/ui/KoboDisplay';
import { EscrowStatusChip, EscrowStatus } from '@/components/escrow/EscrowStatusChip';
import { trpc } from '@/lib/trpc/react';

export default function PaymentsPage() {
  const router = useRouter();
  const { data: escrowsData, isLoading } = trpc.escrow.list.useQuery({ limit: 20 });
  const completed = (escrowsData?.items ?? []).filter(e => e.status === 'completed');

  return (
    <div className="min-h-screen bg-sand">
      <TopNav variant="back" title="Payment Methods" />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white border border-outline-variant rounded-card p-6 shadow-sm mb-8">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-terra/10 flex items-center justify-center text-terra shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-bold text-charcoal text-sm mb-1">Secure Escrow Payments</h3>
              <p className="text-xs text-muted leading-relaxed">
                All payments on Awahouse are processed through secure escrow. Funds are held by our
                payment partners (Monnify / Paystack) and released only after you confirm key handover.
                No saved payment methods are needed — each transaction is handled separately.
              </p>
            </div>
          </div>
        </div>

        <h2 className="font-playfair text-xl font-bold text-charcoal mb-4">Completed Payments</h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="h-20 bg-white rounded-card animate-pulse" />)}
          </div>
        ) : completed.length === 0 ? (
          <div className="bg-white border border-outline-variant rounded-card p-8 text-center shadow-sm">
            <p className="text-sm text-charcoal/60">No completed payments yet.</p>
            <button
              onClick={() => router.push('/explore')}
              className="inline-block mt-3 text-sm font-bold text-terra hover:underline"
            >
              Explore properties
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {completed.map((e) => (
              <div
                key={e.id}
                className="bg-white border border-outline-variant rounded-card p-4 shadow-sm cursor-pointer hover:border-terra transition-colors"
                onClick={() => router.push(`/escrow/${e.id}`)}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-sm text-charcoal truncate">{e.property.title}</p>
                  <EscrowStatusChip status={e.status as EscrowStatus} />
                </div>
                <div className="flex items-center justify-between">
                  <KoboDisplay kobo={Number(e.amountKobo)} size="sm" />
                  <span className="text-[10px] text-muted">
                    {new Date(e.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
