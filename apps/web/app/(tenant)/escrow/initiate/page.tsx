'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, Lock, ShieldCheck, ChevronDown, Building } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { TopNav } from '@/components/layout/TopNav';
import { Button } from '@/components/ui/Button';
import { KoboDisplay } from '@/components/ui/KoboDisplay';
import { VerifiedBadge, BadgeType } from '@/components/ui/VerifiedBadge';
import { trpc } from '@/lib/trpc/react';

export default function EscrowInitiatePage() {
  return (
    <Suspense fallback={null}>
      <EscrowInitiateForm />
    </Suspense>
  );
}

function EscrowInitiateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId');

  const { data: property, isLoading, error: fetchError } = trpc.properties.getById.useQuery(
    { id: propertyId ?? '' },
    { enabled: !!propertyId },
  );

  const [handoverDate, setHandoverDate] = React.useState('');
  const [payMonthly, setPayMonthly] = React.useState(false);
  const [agreed, setAgreed] = React.useState(false);
  const [error, setError] = React.useState('');

  const escrowMutation = trpc.escrow.initiate.useMutation({
    onSuccess: (data) => {
      window.location.href = data.authorizationUrl;
    },
    onError: (err) => {
      setError(err.message ?? 'Failed to initiate escrow');
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-sand">
        <TopNav variant="back" title="Secure this Property" />
        <div className="flex-1 px-4 py-6">
          <div className="bg-white rounded-card p-4 border border-outline-variant flex gap-4 mb-6 shadow-sm animate-pulse">
            <div className="w-[72px] h-[72px] rounded-xl bg-sand-warm shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-sand-warm rounded w-3/4" />
              <div className="h-3 bg-sand-warm rounded w-1/2" />
            </div>
          </div>
          <div className="bg-sand-warm rounded-[14px] p-5 mb-8 border animate-pulse space-y-3">
            <div className="h-4 bg-white/60 rounded w-full" />
            <div className="h-4 bg-white/60 rounded w-full" />
            <div className="h-4 bg-white/60 rounded w-2/3" />
          </div>
          <div className="h-[56px] bg-white rounded-input border animate-pulse" />
        </div>
      </div>
    );
  }

  if (fetchError || !property) {
    return (
      <div className="flex flex-col min-h-screen bg-sand">
        <TopNav variant="back" title="Secure this Property" />
        <div className="flex-1 px-4 py-6 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted text-sm mb-4">
              {fetchError?.message ?? 'Property not found'}
            </p>
            <Button variant="secondary" onClick={() => router.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const priceKobo = Number(property.priceKobo);
  const platformFeeKobo = Math.floor(priceKobo * 0.015);
  const imageUrl = property.images?.[0]?.signedUrl ?? null;
  const badgeType = property.verificationBadge as BadgeType;

  const handleSubmit = () => {
    if (!agreed || !handoverDate || !propertyId) return;
    setError('');
    escrowMutation.mutate({
      propertyId,
      amountKobo: property.priceKobo,
      rentMonthly: payMonthly,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-sand pb-12">
      <TopNav variant="back" title="Secure this Property" />

      <div className="flex-1 px-4 py-6 overflow-y-auto">
        {/* Error banner */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-card text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Property Summary Card */}
        <div className="bg-white rounded-card p-4 border border-outline-variant flex gap-4 mb-6 shadow-sm">
          <div className="w-[72px] h-[72px] rounded-xl bg-sand-warm overflow-hidden shrink-0">
            {imageUrl ? (
              <img src={imageUrl} alt={property.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-terra-light/20 to-terra/10 flex items-center justify-center">
                <Building size={24} className="text-terra/40" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-charcoal truncate mb-0.5">{property.title}</h3>
            <p className="text-[11px] text-muted uppercase tracking-wider font-mono mb-2">
              {property.lga ?? 'Lagos'}, Lagos
            </p>
            <div className="flex justify-between items-center">
              <KoboDisplay kobo={priceKobo} period="yearly" size="sm" />
              <VerifiedBadge type={badgeType} size="sm" />
            </div>
          </div>
        </div>

        {/* Escrow Summary Box */}
        <div className="bg-sand-warm rounded-[14px] p-5 mb-8 border border-outline-variant/50">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Annual Rent</span>
              <KoboDisplay kobo={priceKobo} color="charcoal" size="sm" />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Platform Fee (1.5%)</span>
              <KoboDisplay kobo={platformFeeKobo} color="charcoal" size="sm" />
            </div>
            <div className="h-[1px] bg-outline-variant/30 my-2" />
            <div className="flex justify-between items-end">
              <span className="font-bold text-charcoal">You Pay</span>
              <KoboDisplay kobo={priceKobo} size="lg" color="terra" />
            </div>
            <p className="text-[11px] text-muted italic text-right mt-1">
              Fee deducted from landlord payout
            </p>
          </div>
        </div>

        {/* Handover Date */}
        <div className="mb-8">
          <label className="block font-mono text-[11px] uppercase tracking-widest text-muted mb-3">
            HANDOVER DATE
          </label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input
              type="date"
              value={handoverDate}
              onChange={(e) => setHandoverDate(e.target.value)}
              className="w-full h-[56px] pl-12 pr-4 rounded-input border border-outline-variant bg-white font-sans text-sm focus:border-terra outline-none transition-all appearance-none"
            />
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={18} />
          </div>
        </div>

        {/* Rent Monthly Toggle */}
        <div
          onClick={() => setPayMonthly(!payMonthly)}
          className={cn(
            'p-5 rounded-card border-2 transition-all duration-200 cursor-pointer mb-8 bg-white',
            payMonthly ? 'border-terra bg-terra-50' : 'border-outline-variant'
          )}
        >
          <div className="flex justify-between items-center mb-1">
            <h4 className="font-bold text-charcoal">Pay monthly instead of upfront</h4>
            <div className={cn(
              'w-10 h-6 rounded-full relative transition-colors duration-200',
              payMonthly ? 'bg-terra' : 'bg-outline-variant'
            )}>
              <motion.div
                animate={{ x: payMonthly ? 18 : 2 }}
                className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
              />
            </div>
          </div>
          {payMonthly ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 pt-3 border-t border-terra/10"
            >
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-mono text-lg font-bold text-terra-dark">
                  ≈ ₦{Math.floor(priceKobo / 1200).toLocaleString()}
                </span>
                <span className="text-[11px] text-muted font-sans">/month</span>
              </div>
              <p className="text-xs text-muted">For 12 months · No interest applied</p>
            </motion.div>
          ) : (
            <p className="text-xs text-muted">100% interest-free monthly payments</p>
          )}
        </div>

        {/* Terms Checkbox */}
        <div className="flex gap-3 mb-8 items-start">
          <div
            onClick={() => setAgreed(!agreed)}
            className={cn(
              'w-5 h-5 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all cursor-pointer',
              agreed ? 'bg-terra border-terra' : 'border-outline-variant'
            )}
          >
            {agreed && <ShieldCheck size={12} className="text-white" />}
          </div>
          <p className="text-xs text-muted leading-relaxed">
            I agree to Awahouse <span className="text-terra underline">Escrow Terms</span> and understand my deposit is secured until handover confirmation.
          </p>
        </div>

        {/* Action Button */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!agreed || !handoverDate || escrowMutation.isPending}
          onClick={handleSubmit}
          className="shadow-fab"
          icon={<Lock size={20} />}
        >
          {escrowMutation.isPending ? 'Redirecting to Paystack...' : 'Proceed to Payment'}
        </Button>
        <p className="text-[11px] text-muted text-center mt-3 uppercase tracking-widest font-mono">
          Secured by Paystack
        </p>
      </div>
    </div>
  );
}
