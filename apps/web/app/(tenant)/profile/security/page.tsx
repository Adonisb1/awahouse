'use client';

import { ShieldCheck, User, Lock, Eye } from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { useAuthStore } from '@/hooks/useAuthStore';
import { trpc } from '@/lib/trpc/react';

export default function SecurityPage() {
  const { userId } = useAuthStore();
  const { data: verifData } = trpc.verification.checkStatus.useQuery();

  const verifications = verifData?.verifications ?? [];
  const isNinVerified = verifications.some(v => v.type === 'nin' && v.status === 'approved');

  return (
    <div className="min-h-screen bg-sand">
      <TopNav variant="back" title="Security & Privacy" />

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Verification Status */}
        <section className="bg-white border border-outline-variant rounded-card p-6 shadow-sm">
          <div className="flex gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-success-bg flex items-center justify-center text-success shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-bold text-charcoal text-sm">Verification Status</h3>
              <p className="text-xs text-muted mt-1">
                {isNinVerified
                  ? 'Your identity has been verified.'
                  : 'Verify your identity to unlock full platform access.'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {isNinVerified && <VerifiedBadge type="nin_verified" size="sm" />}
            {!isNinVerified && (
              <span className="text-[10px] font-mono text-muted uppercase tracking-widest bg-sand px-3 py-1.5 rounded-badge">
                NIN — Not verified
              </span>
            )}
          </div>
        </section>

        {/* Account ID */}
        <section className="bg-white border border-outline-variant rounded-card p-6 shadow-sm">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center text-muted shrink-0">
              <User size={20} />
            </div>
            <div>
              <h3 className="font-bold text-charcoal text-sm">Account ID</h3>
              <p className="text-xs font-mono text-muted mt-1 break-all">{userId}</p>
              <p className="text-[10px] text-muted mt-2">
                This is your unique account identifier. Share it with Awahouse support if you need help.
              </p>
            </div>
          </div>
        </section>

        {/* Data Privacy */}
        <section className="bg-white border border-outline-variant rounded-card p-6 shadow-sm">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center text-muted shrink-0">
              <Eye size={20} />
            </div>
            <div>
              <h3 className="font-bold text-charcoal text-sm">Data Privacy</h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Your personal data is encrypted and stored securely. We never share your information
                with third parties without your consent. NIN data is hashed and never stored in plaintext.
              </p>
              <p className="text-xs text-muted mt-3">
                <a href="#" className="text-terra hover:underline">Privacy Policy</a>
                {' \u00b7 '}
                <a href="#" className="text-terra hover:underline">Terms of Service</a>
              </p>
            </div>
          </div>
        </section>

        {/* Placeholder */}
        <section className="bg-white border border-outline-variant rounded-card p-6 shadow-sm opacity-60">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center text-muted shrink-0">
              <Lock size={20} />
            </div>
            <div>
              <h3 className="font-bold text-charcoal text-sm">Account Actions</h3>
              <p className="text-xs text-muted mt-1">
                Password management, session controls, and account deletion will be available soon.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
