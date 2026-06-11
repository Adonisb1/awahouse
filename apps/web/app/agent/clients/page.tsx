'use client';

import { useRouter } from 'next/navigation';
import { Users, User as UserIcon } from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';

export default function AgentClientsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-sand">
      <TopNav variant="back" title="Clients" onBack={() => router.push('/agent')} />

      <div className="flex-1 px-4 py-6">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-display text-xl font-bold text-charcoal mb-2">Your Clients</h2>
          <p className="text-sm text-charcoal/60 max-w-xs">
            Clients you&apos;ve worked with will appear here once you complete transactions.
          </p>
        </div>
      </div>
    </div>
  );
}
