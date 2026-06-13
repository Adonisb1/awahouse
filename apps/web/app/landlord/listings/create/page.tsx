'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PropertyForm } from '@/components/property/PropertyForm';
import { TopNav } from '@/components/layout/TopNav';
import { trpc } from '@/lib/trpc/react';

export default function CreateListingPage() {
  const router = useRouter();
  const createMutation = trpc.properties.create.useMutation();

  const handleSubmit = async (data: any) => {
    try {
        await createMutation.mutateAsync({
            ...data,
            priceYearlyKobo: Number(data.priceYearlyKobo),
            serviceChargeKobo: Number(data.serviceChargeKobo),
            depositKobo: Number(data.depositKobo),
        });
        router.push('/dashboard');
    } catch (e) {
        console.error('Failed to create listing', e);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-sand pb-12">
      <TopNav variant="back" title="Create Listing" />
      <div className="flex-1 px-6 overflow-y-auto">
        <PropertyForm onSubmit={handleSubmit} isSubmitting={createMutation.isPending} />
      </div>
    </div>
  );
}
