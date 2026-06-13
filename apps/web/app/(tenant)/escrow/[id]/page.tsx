'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CheckCircle2, Info, Key, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { TopNav } from '@/components/layout/TopNav';
import { BottomNav } from '@/components/layout/BottomNav';
import { KoboDisplay } from '@/components/ui/KoboDisplay';
import { EscrowStatusChip } from '@/components/escrow/EscrowStatusChip';
import { Button } from '@/components/ui/Button';
import { trpc } from '@/lib/trpc/react';
import { NotificationBell } from '@/components/layout/NotificationBell';

export default function EscrowDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const escrowId = params.id as string;
  
  const utils = trpc.useUtils();
  const { data: transaction, isLoading } = trpc.escrow.getById.useQuery({ escrowId });
  const confirmMutation = trpc.escrow.confirmHandover.useMutation({
      onSuccess: () => utils.escrow.getById.invalidate({ escrowId }),
  });
  const disputeMutation = trpc.escrow.raiseDispute.useMutation({
      onSuccess: () => utils.escrow.getById.invalidate({ escrowId }),
  });
  
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  const [showDisputeModal, setShowDisputeModal] = React.useState(false);
  const [confirmStep, setConfirmStep] = React.useState(1);

  const handleConfirmHandover = async () => {
    if (confirmStep === 1) {
      setConfirmStep(2);
    } else {
      await confirmMutation.mutateAsync({ escrowId });
      setShowConfirmModal(false);
      setConfirmStep(1);
    }
  };

  const handleRaiseDispute = async () => {
      await disputeMutation.mutateAsync({ escrowId, reason: 'Dispute raised by tenant' });
      setShowDisputeModal(false);
  };

  if (isLoading) return <div className="min-h-screen bg-sand flex items-center justify-center">Loading...</div>;
  if (!transaction) return <div className="min-h-screen bg-sand flex items-center justify-center">Transaction not found.</div>;

  const isCompleted = transaction.status === 'COMPLETED';

  return (
    <div className="flex flex-col min-h-screen bg-sand pb-[80px]">
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

      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-5xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="font-playfair text-2xl font-bold text-charcoal">Escrow Protection</h1>
            <p className="text-[13px] text-muted">Your deposit is safe and secured.</p>
          </div>
          <EscrowStatusChip status={transaction.status as any} />
        </div>

        {/* Transaction Card */}
        <div className="bg-white border border-outline-variant rounded-card p-5 shadow-sm mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="font-mono text-[10px] uppercase text-muted tracking-widest block mb-1">
                {isCompleted ? 'COMPLETED TRANSACTION' : 'ACTIVE TRANSACTION'}
              </span>
              <h3 className="text-base font-bold text-charcoal leading-tight">
                {transaction.propertyTitle}
              </h3>
            </div>
            <div className="text-right">
              <KoboDisplay kobo={Number(transaction.amountKobo)} size="lg" color="terra" />
              <span className="font-mono text-[10px] uppercase text-muted tracking-widest block mt-1">TOTAL SEC</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-8 relative">
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-outline-variant/30" />
            
            {/* Step 3 */}
            <div className="relative flex gap-4">
              {isCompleted ? (
                <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center text-white z-10 shrink-0">
                  <CheckCircle2 size={14} />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-terra-50 border-2 border-terra flex items-center justify-center text-terra z-10 shrink-0 relative">
                  <div className="absolute inset-0 bg-terra rounded-full animate-ping opacity-20" />
                  <Key size={12} className="relative z-10" />
                </div>
              )}
              <div className="flex-1">
                <h4 className={cn('text-sm font-bold', isCompleted ? 'text-charcoal' : 'text-terra-dark')}>
                  {isCompleted ? 'Key Handover Confirmed' : 'Key Handover Pending'}
                </h4>
                <p className="text-xs text-muted">Scheduled for {transaction.handoverDate}.</p>
                {!isCompleted && transaction.status === 'KEY_HANDOVER_PENDING' && (
                  <div className="flex gap-3">
                    <Button
                      variant="primary"
                      size="sm"
                      className="mt-3 h-9 px-4 bg-terra-dark border-none shadow-none text-xs"
                      onClick={() => setShowConfirmModal(true)}
                      loading={confirmMutation.isPending}
                    >
                      Confirm Receipt
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      className="mt-3 h-9 px-4 text-xs"
                      onClick={() => setShowDisputeModal(true)}
                      loading={disputeMutation.isPending}
                    >
                      Raise Dispute
                    </Button>
                  </div>
                )}
              </div>
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
              onClick={() => setShowConfirmModal(false)}
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
                <Button variant="ghost" size="lg" fullWidth onClick={() => setShowConfirmModal(false)}>
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
              onClick={() => setShowDisputeModal(false)}
              className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-[100]"
            />
             <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[90%] max-w-[340px] bg-white rounded-[24px] p-6 shadow-2xl"
            >
              <h3 className="font-bold text-lg mb-4 text-center">Raise a Dispute?</h3>
              <p className="text-sm text-muted mb-6 text-center">Are you sure you want to raise a dispute? This will freeze funds while we investigate.</p>
              <div className="flex flex-col gap-3">
                  <Button variant="danger" fullWidth onClick={handleRaiseDispute}>Confirm Dispute</Button>
                  <Button variant="ghost" fullWidth onClick={() => setShowDisputeModal(false)}>Cancel</Button>
              </div>
            </motion.div>
           </>
        )}
      </AnimatePresence>
    </div>
  );
}
