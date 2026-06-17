'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CheckCircle2, Key, CreditCard, FileText, AlertCircle, Info, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { TopNav } from '@/components/layout/TopNav';
import { BottomNav } from '@/components/layout/BottomNav';
import { KoboDisplay } from '@/components/ui/KoboDisplay';
import { EscrowStatusChip, EscrowStatus } from '@/components/escrow/EscrowStatusChip';
import { Button } from '@/components/ui/Button';
import { trpc } from '@/lib/trpc/react';
import { NotificationBell } from '@/components/layout/NotificationBell';

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

export default function EscrowDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const escrowId = params.id as string;

  const [error, setError] = React.useState('');
  const utils = trpc.useUtils();
  const { data: transaction, isLoading } = trpc.escrow.getById.useQuery(
    { id: escrowId },
    { refetchInterval: (query) => query.state.data?.status === 'pending_payment' ? 5000 : false },
  );
  const confirmMutation = trpc.escrow.confirmHandover.useMutation({
    onSuccess: (data) => {
      utils.escrow.getById.invalidate({ id: escrowId });
      if (data.showReviewPrompt && data.propertyId) {
        router.push(`/property/${data.propertyId}/reviews`);
      }
    },
    onError: (err) => setError(err.message),
  });
  const disputeMutation = trpc.escrow.raiseDispute.useMutation({
    onSuccess: () => {
      utils.escrow.getById.invalidate({ id: escrowId });
    },
    onError: (err) => setError(err.message),
  });

  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  const [showDisputeModal, setShowDisputeModal] = React.useState(false);
  const [confirmStep, setConfirmStep] = React.useState(1);
  const [disputeReason, setDisputeReason] = React.useState('');
  const [disputeError, setDisputeError] = React.useState('');

  const handleConfirmHandover = async () => {
    try {
      if (confirmStep === 1) {
        setConfirmStep(2);
      } else {
        await confirmMutation.mutateAsync({ escrowId });
        setShowConfirmModal(false);
        setConfirmStep(1);
      }
    } catch {}
  };

  const handleRaiseDispute = async () => {
    if (disputeReason.trim().length < 10) {
      setDisputeError('Please describe the issue in at least 10 characters');
      return;
    }
    setDisputeError('');
    try {
      await disputeMutation.mutateAsync({ escrowId, reason: disputeReason });
      setShowDisputeModal(false);
      setDisputeReason('');
    } catch {}
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-sand pb-[80px]">
        <TopNav variant="back" title="Escrow Details" />
        <div className="flex-1 px-4 py-6 max-w-5xl mx-auto w-full space-y-6 animate-pulse">
          <div className="flex justify-between">
            <div className="space-y-2">
              <div className="h-6 bg-sand-warm rounded w-40" />
              <div className="h-3 bg-sand-warm rounded w-24" />
            </div>
            <div className="h-6 bg-sand-warm rounded w-28" />
          </div>
          <div className="bg-white rounded-card p-5 border space-y-4">
            <div className="flex justify-between">
              <div className="space-y-2">
                <div className="h-3 bg-sand-warm rounded w-20" />
                <div className="h-4 bg-sand-warm rounded w-48" />
              </div>
              <div className="h-8 bg-sand-warm rounded w-24" />
            </div>
            <div className="space-y-6 pt-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="w-6 h-6 rounded-full bg-sand-warm shrink-0" />
                  <div className="h-4 bg-sand-warm rounded w-32" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <BottomNav role="TENANT" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="flex flex-col min-h-screen bg-sand pb-[80px]">
        <TopNav variant="back" title="Escrow Details" />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-muted text-sm mb-4">Transaction not found.</p>
            <Button variant="secondary" onClick={() => window.history.back()}>Go Back</Button>
          </div>
        </div>
        <BottomNav role="TENANT" />
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
  const provider = transaction.paymentProvider as string | undefined;

  return (
    <div className="flex flex-col min-h-screen bg-sand pb-[80px]">
      <TopNav
        variant="back"
        title="Escrow Details"
        actions={
          <div className="flex gap-2">
            <NotificationBell />
            <button className="w-10 h-10 rounded-full bg-white border border-outline-variant flex items-center justify-center text-muted">
              <UserIcon size={20} />
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-6xl mx-auto w-full">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <div className="mb-8">
          <h1 className="font-playfair text-3xl font-bold text-charcoal">
            {isTerminal ? terminalLabel : 'Escrow Protection'}
          </h1>
          <p className="text-sm text-muted">
            {isTerminal ? `This transaction has been ${terminalLabel?.toLowerCase()}` : 'Your deposit is safe and secured with Awahouse.'}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Column: Status & Timeline */}
          <div className="flex-1 space-y-6">
            {isTerminal && status === 'disputed' && (
              <div className="bg-red-50 border border-red-200 rounded-card p-5 flex gap-4">
                <AlertCircle className="text-red-600 shrink-0" size={24} />
                <div>
                  <h4 className="font-bold text-red-900">Dispute Raised</h4>
                  <p className="text-sm text-red-800 mt-1">Funds are frozen while our support team reviews your case. You will be notified of the outcome.</p>
                </div>
              </div>
            )}

            {isTerminal && status === 'refunded' && (
              <div className="bg-gray-100 border border-gray-200 rounded-card p-5 flex gap-4">
                <Info className="text-gray-600 shrink-0" size={24} />
                <div>
                  <h4 className="font-bold text-gray-900">Transaction Refunded</h4>
                  <p className="text-sm text-gray-700 mt-1">The funds have been returned. Please allow 1-3 business days for the refund to reflect in your account.</p>
                </div>
              </div>
            )}

            {status === 'pending_payment' && (
              <div className="bg-amber-50 border border-amber-200 rounded-card p-5 flex gap-4 shadow-sm">
                <Info className="text-amber-600 shrink-0" size={24} />
                <div>
                  <h4 className="font-bold text-amber-900">Awaiting Payment Confirmation</h4>
                  <p className="text-sm text-amber-800 mt-1">We&apos;re waiting for payment confirmation from {provider === 'paystack' ? 'Paystack' : 'Monnify'}. This page will update automatically once confirmed.</p>
                </div>
              </div>
            )}

            {status === 'key_handover_pending' && (
              <div className="bg-blue-50 border border-blue-200 rounded-card p-5 flex gap-4 shadow-sm">
                <Info className="text-blue-600 shrink-0" size={24} />
                <div>
                  <h4 className="font-bold text-blue-900">Handover Pending</h4>
                  <p className="text-sm text-blue-800 mt-1 text-pretty">Funds will be automatically released to the landlord if you don&apos;t confirm or raise a dispute within 48 hours.</p>
                </div>
              </div>
            )}

            {/* Transaction Card */}
            <div className="bg-white border border-outline-variant rounded-card p-6 md:p-8 shadow-card">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                <div>
                  <span className="font-mono text-[10px] uppercase text-muted tracking-widest block mb-1">
                    {isTerminal ? `${terminalLabel?.toUpperCase()} TRANSACTION` : 'ACTIVE TRANSACTION'}
                  </span>
                  <h3 className="text-xl font-bold text-charcoal leading-tight">
                    {property.title ?? 'Property'}
                  </h3>
                </div>
                <div className="md:text-right">
                  <KoboDisplay kobo={Number(transaction.amountKobo)} size="display" color="terra" />
                  <span className="font-mono text-[10px] uppercase text-muted tracking-widest block mt-1">TOTAL SECURED</span>
                </div>
              </div>

              {/* Timeline */}
              {!isTerminal ? (
                <div className="space-y-0 relative max-w-md mx-auto md:mx-0">
                  <div className="absolute left-[11px] top-1 bottom-1 w-0.5 bg-outline-variant/30" />
                  {STEPS.map((step) => {
                    const state = getStepState(step.key, currentIdx, terminalIdx);
                    const Icon = step.icon;
                    return (
                      <div key={step.key} className="relative flex gap-6 pb-10 last:pb-0">
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
                            'text-base font-bold',
                            state === 'done' ? 'text-charcoal' : state === 'current' ? 'text-terra-dark font-black' : 'text-gray-300',
                          )}>
                            {step.label}
                          </h4>
                          {state === 'current' && step.key === 'key_handover_pending' && (
                            <div className="flex flex-wrap gap-3 mt-4">
                              <Button
                                variant="primary"
                                size="md"
                                className="px-6 bg-terra-dark border-none shadow-none text-sm"
                                onClick={() => setShowConfirmModal(true)}
                                loading={confirmMutation.isPending}
                              >
                                Confirm Receipt
                              </Button>
                              <Button
                                variant="danger"
                                size="md"
                                className="px-6 text-sm"
                                onClick={() => setShowDisputeModal(true)}
                                loading={disputeMutation.isPending}
                              >
                                Raise Dispute
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    {status === 'disputed' ? <AlertCircle size={32} className="text-red-500" /> :
                     status === 'refunded' ? <Info size={32} className="text-gray-500" /> :
                     <Info size={32} className="text-gray-500" />}
                  </div>
                  <p className="text-base text-muted font-medium">This transaction has reached its terminal state.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sidebar Details */}
          <div className="w-full lg:w-[360px] space-y-6">
            <div className="bg-white border border-outline-variant rounded-card p-6 shadow-sm">
              <h4 className="font-bold text-charcoal text-sm mb-6 uppercase tracking-wider">Transaction Details</h4>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-sand-warm">
                  <span className="text-muted">Created</span>
                  <span className="font-bold text-charcoal">{new Date(transaction.createdAt).toLocaleDateString()}</span>
                </div>
                {transaction.completedAt && (
                  <div className="flex justify-between items-center py-2 border-b border-sand-warm">
                    <span className="text-muted">Completed</span>
                    <span className="font-bold text-charcoal">{new Date(transaction.completedAt).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-sand-warm">
                  <span className="text-muted">Provider</span>
                  <span className="font-bold text-charcoal capitalize">{provider ?? 'Monnify'}</span>
                </div>
                {transaction.paymentReference && (
                  <div className="flex flex-col gap-1 py-2 border-b border-sand-warm">
                    <span className="text-muted">Reference</span>
                    <span className="font-mono text-[11px] text-charcoal break-all bg-sand/30 p-1.5 rounded">{transaction.paymentReference}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-sand-warm">
                  <span className="text-muted">Rent Monthly</span>
                  <span className="font-bold text-charcoal">{transaction.rentMonthly ? 'Yes' : 'No'}</span>
                </div>
                {transaction.rentMonthly && (
                  <div className="pt-2">
                    <Button 
                      variant="ghost" 
                      fullWidth 
                      onClick={() => router.push('/rent-instalments')}
                      className="text-terra-dark font-bold text-xs bg-terra/5 hover:bg-terra/10"
                    >
                      View Payment Schedule &rarr;
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-success-bg border border-success/20 rounded-card p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-success/10 rounded-lg text-success">
                  <ShieldCheck size={20} />
                </div>
                <h4 className="font-bold text-success text-sm">Awahouse Guarantee</h4>
              </div>
              <p className="text-xs text-success/80 leading-relaxed">
                Your funds are held in a secure CBN-licensed account. We only release payments to the landlord once you confirm you&apos;ve received the keys and the property is as described.
              </p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav role="TENANT" />

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowConfirmModal(false); setConfirmStep(1); }}
              className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[90%] max-w-[340px] bg-white rounded-[24px] p-6 shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-terra/10 text-terra rounded-full flex items-center justify-center mx-auto mb-4">
                  <Key size={32} />
                </div>
                <h3 className="font-playfair font-bold text-xl text-charcoal mb-2">
                  {confirmStep === 1 ? 'Confirm Receipt?' : 'Release Funds?'}
                </h3>
                <p className="text-sm text-muted">
                  {confirmStep === 1
                    ? 'Have you successfully received the keys and inspected the property?'
                    : 'Funds will be released to the landlord. This action cannot be undone.'}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button variant="primary" size="lg" fullWidth onClick={handleConfirmHandover}>
                  {confirmStep === 1 ? 'Yes, I have them' : 'Confirm & Release'}
                </Button>
                <Button variant="ghost" size="lg" fullWidth onClick={() => { setShowConfirmModal(false); setConfirmStep(1); }}>
                  Cancel
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Dispute Modal */}
      <AnimatePresence>
        {showDisputeModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowDisputeModal(false); setDisputeReason(''); setDisputeError(''); }}
              className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[90%] max-w-[340px] bg-white rounded-[24px] p-6 shadow-2xl"
            >
              <h3 className="font-bold text-lg mb-2 text-center">Raise a Dispute</h3>
              <p className="text-sm text-muted mb-4 text-center">Funds will be frozen while we investigate.</p>

              <textarea
                value={disputeReason}
                onChange={(e) => { setDisputeReason(e.target.value); setDisputeError(''); }}
                placeholder="Describe the issue (min. 10 characters)..."
                rows={4}
                className="w-full border border-outline-variant rounded-card p-3 text-sm resize-none focus:border-terra outline-none mb-1"
              />
              {disputeError && (
                <p className="text-xs text-red-600 mb-3">{disputeError}</p>
              )}
              <p className="text-[11px] text-muted text-right mb-4">{disputeReason.length} / 10 min</p>

              <div className="flex flex-col gap-3">
                <Button variant="danger" fullWidth onClick={handleRaiseDispute} loading={disputeMutation.isPending}>
                  Submit Dispute
                </Button>
                <Button variant="ghost" fullWidth onClick={() => { setShowDisputeModal(false); setDisputeReason(''); setDisputeError(''); }}>
                  Cancel
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
