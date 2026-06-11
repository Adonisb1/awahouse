'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, User as UserIcon, ShieldCheck, CheckCircle2, Info, Key } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { TopNav } from '@/components/layout/TopNav';
import { BottomNav } from '@/components/layout/BottomNav';
import { KoboDisplay } from '@/components/ui/KoboDisplay';
import { Button } from '@/components/ui/Button';
import { mockEscrowTransactions } from '@/lib/mock';

export default function EscrowDashboardPage() {
  const params = useParams();
  const escrowId = params.id as string;
  const transaction = (mockEscrowTransactions.find(t => t.id === escrowId) || mockEscrowTransactions[0])!;
  
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  const [confirmStep, setConfirmStep] = React.useState(1);
  const [isCompleted, setIsCompleted] = React.useState(transaction.status === 'COMPLETED');

  const handleConfirmHandover = () => {
    if (confirmStep === 1) {
      setConfirmStep(2);
    } else {
      setShowConfirmModal(false);
      setIsCompleted(true);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-sand pb-[80px]">
      <TopNav
        variant="brand"
        actions={
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full bg-white border border-outline-variant flex items-center justify-center text-muted">
              <Bell size={20} />
            </button>
            <button className="w-10 h-10 rounded-full bg-white border border-outline-variant flex items-center justify-center text-muted">
              <UserIcon size={20} />
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="font-playfair text-2xl font-bold text-charcoal">Escrow Protection</h1>
            <p className="text-[13px] text-muted">Your deposit is safe and secured.</p>
          </div>
          <div className="bg-success-bg text-success text-[10px] font-mono px-2 py-1 rounded-badge border border-success/20 font-bold uppercase tracking-wider">
            ✓ PROT
          </div>
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
              <KoboDisplay kobo={transaction.amountKobo} size="lg" color="terra" />
              <span className="font-mono text-[10px] uppercase text-muted tracking-widest block mt-1">TOTAL SEC</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-8 relative">
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-outline-variant/30" />
            
            {/* Step 1 */}
            <div className="relative flex gap-4">
              <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center text-white z-10 shrink-0">
                <CheckCircle2 size={14} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-charcoal">Deposit Paid</h4>
                <p className="text-xs text-muted">Funds received and held in secure escrow.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex gap-4">
              <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center text-white z-10 shrink-0">
                <CheckCircle2 size={14} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-charcoal">Title Check Complete</h4>
                <p className="text-xs text-muted">Property documents verified by legal team.</p>
              </div>
            </div>

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
                {!isCompleted && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-3 h-9 px-4 bg-terra-dark border-none shadow-none text-xs"
                    onClick={() => setShowConfirmModal(true)}
                  >
                    Confirm Receipt
                  </Button>
                )}
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative flex gap-4">
              <div className={cn(
                'w-6 h-6 rounded-full border-2 z-10 shrink-0 flex items-center justify-center',
                isCompleted ? 'bg-success border-success text-white' : 'bg-white border-outline-variant text-muted'
              )}>
                {isCompleted ? <CheckCircle2 size={14} /> : <div className="w-1.5 h-1.5 bg-outline-variant/30 rounded-full" />}
              </div>
              <div>
                <h4 className={cn('text-sm font-bold', isCompleted ? 'text-charcoal' : 'text-muted')}>
                  Funds Released
                </h4>
                <p className="text-xs text-muted">
                  {isCompleted ? 'Funds transferred to landlord payout account.' : 'Awaiting handover confirmation.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Guarantee Card */}
        <div className="bg-sand-warm border border-outline-variant rounded-card p-5 flex items-center gap-5 mb-6">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-terra-dark shadow-sm shrink-0">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h4 className="font-bold text-charcoal text-[15px]">Awahouse Guarantee</h4>
            <p className="text-xs text-muted leading-relaxed">
              We act as a neutral third party, ensuring your funds are protected until keys are in your hand.
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-success-bg border border-success/20 rounded-card p-5">
          <div className="flex items-center gap-2 mb-3 text-success">
            <Info size={18} />
            <h4 className="font-bold text-sm">How it works</h4>
          </div>
          <ul className="space-y-2 text-xs text-success/80 leading-relaxed list-decimal pl-4">
            <li>Tenant deposits annual rent into secure escrow.</li>
            <li>Awahouse legal team verifies property title and agent authority.</li>
            <li>Keys are handed over at the property.</li>
            <li>Tenant confirms receipt; funds are released to landlord.</li>
          </ul>
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
              className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-[100] max-w-[430px] mx-auto"
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
    </div>
  );
}
