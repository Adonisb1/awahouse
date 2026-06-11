'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Info, Lock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { TopNav } from '@/components/layout/TopNav';
import { trpc } from '@/lib/trpc/react';
import { useAuthStore } from '@/hooks/useAuthStore';

export default function NINVerificationPage() {
  const router = useRouter();
  const activeRole = useAuthStore((s) => s.activeRole);
  const [nin, setNin] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success'>('idle');

  const submitNinMutation = trpc.verification.submitNin.useMutation();
  const { data: statusData, refetch: refetchStatus } = trpc.verification.checkStatus.useQuery(undefined, {
    enabled: status === 'loading',
    refetchInterval: (query) => {
      const verif = query.state.data?.verifications.find(v => v.type === 'nin');
      return verif?.status === 'pending' ? 2000 : false;
    }
  });

  React.useEffect(() => {
    const ninVerif = statusData?.verifications.find(v => v.type === 'nin');
    if (ninVerif?.status === 'approved') {
      setStatus('success');
      const timer = setTimeout(() => {
        if (activeRole === 'agent') {
          router.push('/onboarding/verify-agent');
        } else if (activeRole === 'landlord') {
          router.push('/dashboard');
        } else {
          router.push('/explore');
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [statusData, activeRole, router]);

  const handleVerify = async () => {
    if (nin.length === 11) {
      try {
        setStatus('loading');
        await submitNinMutation.mutateAsync({ 
          nin,
          faceImageBase64: 'stub-image'
        });
        refetchStatus();
      } catch (error) {
        console.error('NIN submission failed:', error);
        setStatus('idle');
      }
    }
  };

  return (
    <div className="min-h-screen bg-sand flex flex-col">
      <TopNav variant="back" title="Identity Verification" />

      <div className="flex-1 flex flex-col justify-center py-12 px-6">
        <div className="w-full max-w-md mx-auto bg-white p-8 rounded-card shadow-card">
          {/* Shield Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-[72px] h-[72px] bg-success/10 rounded-[22px] flex items-center justify-center text-success">
              <ShieldCheck size={40} />
            </div>
          </div>

          <h1 className="font-playfair text-2xl font-bold text-charcoal text-center mb-2">
            Verify Your Identity
          </h1>
          <p className="text-sm text-muted text-center mb-10">
            Your NIN unlocks all verified features on Awahouse.
          </p>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-4 mb-10">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all duration-300',
                    step === 1 ? 'bg-success border-success text-white' : 
                    step === 2 ? 'border-terra text-terra bg-terra-50' : 
                    'border-outline-variant text-muted'
                  )}
                >
                  {step < 2 ? '✓' : step}
                </div>
                {step < 3 && <div className="w-8 h-[2px] bg-outline-variant/30" />}
              </React.Fragment>
            ))}
          </div>

          {/* Info Cards */}
          <div className="w-full space-y-3 mb-10">
            <div className="p-4 bg-sand/30 border border-outline-variant rounded-[14px] flex gap-3">
              <Info className="text-muted shrink-0" size={20} />
              <div className="text-sm">
                <span className="font-bold text-charcoal">What is NIN?</span>
                <p className="text-muted leading-relaxed">Your 11-digit National Identification Number from NIMC.</p>
              </div>
            </div>
            <div className="p-4 bg-sand/30 border border-outline-variant rounded-[14px] flex gap-3">
              <Lock className="text-muted shrink-0" size={20} />
              <div className="text-sm">
                <span className="font-bold text-charcoal">Your data is safe</span>
                <p className="text-muted leading-relaxed">Bank-grade encryption ensures your data is never shared.</p>
              </div>
            </div>
          </div>

          {/* NIN Input */}
          <div className="w-full mb-10">
            <label className="block font-mono text-[11px] uppercase tracking-widest text-muted text-center mb-3">
              ENTER YOUR NIN
            </label>
            <div className="relative mb-2">
              <input
                type="text"
                maxLength={11}
                value={nin}
                onChange={(e) => setNin(e.target.value.replace(/\D/g, ''))}
                placeholder="00000000000"
                className="w-full h-[56px] rounded-input border-2 border-outline-variant bg-sand/20 text-center font-mono text-[18px] tracking-[0.2em] focus:border-terra outline-none transition-all"
              />
            </div>
            <p className="text-[11px] text-muted text-center uppercase tracking-wider">
              11-digit number
            </p>
          </div>

          {/* Action Button */}
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                key="success"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full py-4 bg-success text-white rounded-button flex items-center justify-center gap-2 font-bold"
              >
                <CheckCircle2 size={24} />
                Identity Verified
              </motion.div>
            ) : (
              <motion.div key="button" className="w-full">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={status === 'loading'}
                  disabled={nin.length !== 11}
                  onClick={handleVerify}
                  className="bg-success border-none shadow-none"
                  icon={status === 'idle' && <ShieldCheck size={20} />}
                >
                  Verify My Identity
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
