'use client';

import { useRouter } from 'next/navigation';
import { User, Settings, HelpCircle, LogOut, BadgeCheck, Shield } from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';
import { BottomNav } from '@/components/layout/BottomNav';
import { trpc } from '@/lib/trpc/react';

export default function AgentProfilePage() {
  const router = useRouter();
  const { data: profile } = trpc.auth.getProfile.useQuery();
  const { data: verifications } = trpc.verification.checkStatus.useQuery();

  const ninVerified = verifications?.verifications?.some(v => v.type === 'nin' && v.status === 'approved');
  const profBodyApproved = verifications?.verifications?.some(
    v => ['lasrera', 'esvarbon', 'niesv', 'aean', 'ercaan', 'redan'].includes(v.type) && v.status === 'approved'
  );
  const profBodyPending = verifications?.verifications?.some(
    v => ['lasrera', 'esvarbon', 'niesv', 'aean', 'ercaan', 'redan'].includes(v.type) && v.status === 'pending'
  );

  const userName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName ?? ''}`
    : 'Agent';

  const userInitials = profile?.firstName?.charAt(0)?.toUpperCase() ?? 'A';

  return (
    <div className="flex flex-col min-h-screen bg-sand">
      <TopNav variant="back" title="Profile" onBack={() => router.push('/agent')} />

      <div className="flex-1 px-4 py-6">
        <div className="flex flex-col items-center mb-10">
          <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
            {userInitials}
          </div>
          <h2 className="font-display text-xl font-bold text-charcoal">{userName}</h2>
          <p className="text-sm text-charcoal/60">{profile?.email}</p>

          <div className="flex gap-2 mt-3">
            {ninVerified && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-success bg-success-bg px-2 py-0.5 rounded-md font-bold uppercase">
                <BadgeCheck size={10} /> NIN Verified
              </span>
            )}
            {profBodyApproved && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-success bg-success-bg px-2 py-0.5 rounded-md font-bold uppercase">
                <BadgeCheck size={10} /> Prof. Body
              </span>
            )}
            {!ninVerified && !profBodyApproved && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md font-bold uppercase">
                <Shield size={10} /> Pending Verification
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <button
            className="flex w-full items-center gap-3 rounded-card bg-white px-4 py-3 text-left shadow-sm hover:bg-sand-warm transition-colors"
            onClick={() => router.push('/onboarding/verify-nin')}
          >
            <User className="h-5 w-5 text-charcoal/60" />
            <div>
              <span className="font-body text-sm text-charcoal block">Verification</span>
              <span className="font-body text-[11px] text-charcoal/40">
                {ninVerified && profBodyApproved ? 'Fully verified' : profBodyPending ? 'Professional body pending' : 'Submit your credentials'}
              </span>
            </div>
          </button>
          <button className="flex w-full items-center gap-3 rounded-card bg-white px-4 py-3 text-left shadow-sm">
            <Settings className="h-5 w-5 text-charcoal/60" />
            <span className="font-body text-sm text-charcoal">Settings</span>
          </button>
          <button className="flex w-full items-center gap-3 rounded-card bg-white px-4 py-3 text-left shadow-sm">
            <HelpCircle className="h-5 w-5 text-charcoal/60" />
            <span className="font-body text-sm text-charcoal">Help & Support</span>
          </button>
          <button className="flex w-full items-center gap-3 rounded-card bg-white px-4 py-3 text-left shadow-sm text-red-500">
            <LogOut className="h-5 w-5" />
            <span className="font-body text-sm">Sign Out</span>
          </button>
        </div>
      </div>
      <BottomNav role="AGENT" />
    </div>
  );
}
