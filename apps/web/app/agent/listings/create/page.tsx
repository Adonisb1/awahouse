'use client';

import { useRouter } from 'next/navigation';
import { Plus, ArrowLeft } from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';
import { Button } from '@/components/ui/Button';

export default function AgentCreateListingPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-sand">
      <TopNav variant="back" title="New Listing" onBack={() => router.push('/agent')} />

      <div className="flex-1 px-4 py-6">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Plus className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-display text-xl font-bold text-charcoal mb-2">Create a listing</h2>
          <p className="text-sm text-charcoal/60 max-w-xs mb-6">
            Fill in property details, upload images, and publish for clients.
          </p>
          <Button onClick={() => router.push('/landlord/listings/new')}>
            Open Listing Form
          </Button>
        </div>
      </div>
    </div>
  );
}
