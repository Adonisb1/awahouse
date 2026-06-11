'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';

export default function LandlordEscrowPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-sand">
      <TopNav variant="back" title="My Escrows" onBack={() => router.push('/landlord')} />

      <div className="flex-1 px-4 py-6">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-display text-xl font-bold text-charcoal mb-2">No active escrows</h2>
          <p className="text-sm text-charcoal/60 max-w-xs">
            Escrow transactions for your properties will appear here once tenants initiate them.
          </p>
        </div>
      </div>
    </div>
  );
}
