'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { ShieldCheck, CheckCircle2, Key, CreditCard, FileText, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { TopNav } from '@/components/layout/TopNav';
import { KoboDisplay } from '@/components/ui/KoboDisplay';
import { EscrowStatusChip, EscrowStatus } from '@/components/escrow/EscrowStatusChip';
import { Button } from '@/components/ui/Button';
import { trpc } from '@/lib/trpc/react';

type StepDef = {
  key: string;
  label: string;
  icon: React.ElementType;
};

const STEPS: StepDef[] = [
  { key: 'pending_payment', label: 'Payment Made', icon: CreditCard },
  { key: 'funds_held', label: 'Funds Secured', icon: ShieldCheck },
  { key: 'docs_verified', label: 'Documents Verified', icon: FileText },
  { key: 'key_handover_pending', label: 'Key Handover', icon: Key },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 },
];

const STATUS_ORDER: Record<string, number> = {
  pending_payment: 0,
  funds_held: 1,
  docs_verified: 2,
  key_handover_pending: 3,
  completed: 4,
};

function getStepState(stepKey: string, currentIdx: number, terminalIdx: number | null): 'done' | 'current' | 'upcoming' {
  const stepIdx = STATUS_ORDER[stepKey];
  if (stepIdx === undefined) return 'upcoming';
  if (terminalIdx !== null) {
    if (typeof terminalIdx === 'number' && stepIdx <= terminalIdx) return 'done';
    if (stepIdx <= currentIdx) return 'done';
    return 'upcoming';
  }
  if (stepIdx < currentIdx) return 'done';
  if (stepIdx === currentIdx) return 'current';
  return 'upcoming';
}

export default function LandlordEscrowPage() {
  const params = useParams();
  const escrowId = params.id as string;

  const { data: transaction, isLoading } = trpc.escrow.getById.useQuery(
    { id: escrowId },
    { refetchInterval: (query) => query.state.data?.status === 'pending_payment' ? 5000 : false },
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sand pb-8">
        <TopNav variant="back" title="Escrow Overview" />
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-pulse">
          <div className="flex justify-between">
            <div className="h-6 bg-sand-warm rounded w-40" />
            <div className="h-6 bg-sand-warm rounded w-28" />
          </div>
          <div className="bg-white rounded-card p-6 border space-y-4">
            <div className="flex justify-between">
              <div className="h-4 bg-sand-warm rounded w-48" />
              <div className="h-8 bg-sand-warm rounded w-24" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 bg-sand-warm rounded w-20" />
                  <div className="h-4 bg-sand-warm rounded w-32" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-sand pb-8">
        <TopNav variant="back" title="Escrow Overview" />
        <div className="max-w-3xl mx-auto px-4 py-8 text-center">
          <p className="text-muted text-sm mb-4">Transaction not found.</p>
          <Button variant="secondary" onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const status = transaction.status as string;
  const currentIdx = STATUS_ORDER[status] ?? -1;
  const terminalStatuses: Record<string, string> = { disputed: 'Disputed', refunded: 'Refunded', cancelled: 'Cancelled' };
  const terminalLabel = terminalStatuses[status] ?? null;
  const terminalIdx = terminalLabel !== null ? currentIdx : null;
  const isTerminal = terminalLabel !== null;
  const property = transaction.property as { title?: string };
  const tenant = transaction.tenant as { firstName?: string; lastName?: string; email?: string } | undefined;
  const provider = transaction.paymentProvider as string | undefined;

  return (
    <div className="min-h-screen bg-sand pb-8">
      <TopNav variant="back" title="Escrow Overview" />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-playfair text-2xl font-bold text-charcoal">
            {isTerminal ? terminalLabel : 'Transaction Details'}
          </h1>
          <EscrowStatusChip status={status as EscrowStatus} />
        </div>

        {isTerminal && status === 'disputed' && (
          <div className="bg-red-50 border border-red-200 rounded-card p-5 mb-6 flex gap-4">
            <AlertCircle className="text-red-600 shrink-0" size={24} />
            <div>
              <h4 className="font-bold text-red-900">Transaction Disputed</h4>
              <p className="text-sm text-red-800 mt-1">Funds are currently frozen while our support team investigates the claim.</p>
            </div>
          </div>
        )}

        {isTerminal && status === 'refunded' && (
          <div className="bg-gray-100 border border-gray-200 rounded-card p-5 mb-6 flex gap-4">
            <Info className="text-gray-600 shrink-0" size={24} />
            <div>
              <h4 className="font-bold text-gray-900">Refunded</h4>
              <p className="text-sm text-gray-700 mt-1">The funds have been returned to the tenant.</p>
            </div>
          </div>
        )}

        {isTerminal && status === 'cancelled' && (
          <div className="bg-gray-100 border border-gray-200 rounded-card p-5 mb-6 flex gap-4">
            <Info className="text-gray-600 shrink-0" size={24} />
            <div>
              <h4 className="font-bold text-gray-900">Cancelled</h4>
              <p className="text-sm text-gray-700 mt-1">This escrow was cancelled before payment was completed.</p>
            </div>
          </div>
        )}

        {status === 'pending_payment' && (
          <div className="bg-amber-50 border border-amber-200 rounded-card p-5 mb-6 flex gap-4">
            <Info className="text-amber-600 shrink-0" size={24} />
            <div>
              <h4 className="font-bold text-amber-900">Awaiting Payment</h4>
              <p className="text-sm text-amber-800 mt-1">The tenant has initiated payment. This page will update automatically once confirmed.</p>
            </div>
          </div>
        )}

        {status === 'key_handover_pending' && (
          <div className="bg-blue-50 border border-blue-200 rounded-card p-5 mb-6 flex gap-4">
            <Info className="text-blue-600 shrink-0" size={24} />
            <div>
              <h4 className="font-bold text-blue-900">Awaiting Handover Confirmation</h4>
              <p className="text-sm text-blue-800 mt-1">The tenant needs to confirm receipt of keys. Funds will be auto-released after 48 hours.</p>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white border border-outline-variant rounded-card p-6 shadow-sm mb-8">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-bold text-charcoal">{property.title ?? 'Property'}</h4>
            <KoboDisplay kobo={Number(transaction.amountKobo)} size="lg" color="terra" />
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Tenant</span>
              <span className="font-bold text-charcoal">{tenant ? (`${tenant.firstName ?? ''} ${tenant.lastName ?? ''}`.trim() || tenant.email || 'N/A') : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Status</span>
              <EscrowStatusChip status={status as EscrowStatus} />
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Created</span>
              <span className="font-medium text-charcoal">{new Date(transaction.createdAt).toLocaleDateString()}</span>
            </div>
            {transaction.completedAt && (
              <div className="flex justify-between">
                <span className="text-muted">Completed</span>
                <span className="font-medium text-charcoal">{new Date(transaction.completedAt).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted">Provider</span>
              <span className="font-medium text-charcoal">{provider === 'paystack' ? 'Paystack' : 'Monnify'}</span>
            </div>
            {transaction.paymentReference && (
              <div className="flex justify-between">
                <span className="text-muted">Reference</span>
                <span className="font-mono text-xs text-charcoal">{transaction.paymentReference}</span>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="mt-8 pt-6 border-t border-outline-variant/30">
            <h4 className="font-bold text-charcoal text-sm mb-6">Progress</h4>
            {!isTerminal ? (
              <div className="space-y-0 relative">
                <div className="absolute left-[11px] top-1 bottom-1 w-0.5 bg-outline-variant/30" />
                {STEPS.map((step) => {
                  const state = getStepState(step.key, currentIdx, terminalIdx);
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
                      {state === 'done' ? (
                        <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center text-white z-10 shrink-0">
                          <CheckCircle2 size={14} />
                        </div>
                      ) : state === 'current' ? (
                        <div className="w-6 h-6 rounded-full bg-terra-50 border-2 border-terra flex items-center justify-center text-terra z-10 shrink-0 relative">
                          <div className="absolute inset-0 bg-terra rounded-full animate-ping opacity-20" />
                          <Icon size={12} className="relative z-10" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-gray-300 z-10 shrink-0">
                          <Icon size={12} />
                        </div>
                      )}
                      <div className="flex-1 pb-1">
                        <h4 className={cn(
                          'text-sm font-bold',
                          state === 'done' ? 'text-charcoal' : state === 'current' ? 'text-terra-dark' : 'text-gray-300',
                        )}>
                          {step.label}
                        </h4>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted text-center py-4">This transaction has reached its terminal state.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
