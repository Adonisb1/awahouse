'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PropertyForm } from '@/components/property/PropertyForm';
import { TopNav } from '@/components/layout/TopNav';
import { trpc } from '@/lib/trpc/react';

const VALID_TYPES = ['apartment', 'duplex', 'bungalow', 'studio', 'commercial'] as const;

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  
  const [error, setError] = React.useState('');
  const { data: property, isLoading } = trpc.properties.getById.useQuery({ id: propertyId });
  const updateMutation = trpc.properties.update.useMutation();

  const handleSubmit = async (data: any) => {
    try {
        setError('');
        const type = (data.type ?? '').toLowerCase();
        if (!VALID_TYPES.includes(type as any)) {
          setError(`Invalid property type: ${data.type}`);
          return;
        }
        await updateMutation.mutateAsync({
            id: propertyId,
            title: data.title,
            description: data.description || undefined,
            address: data.address || undefined,
            lga: data.lga || undefined,
            type: type as typeof VALID_TYPES[number],
            bedrooms: data.bedrooms,
            bathrooms: data.bathrooms,
            priceKobo: BigInt(data.priceYearlyKobo || 0),
            isAvailable: data.isAvailable ?? true,
        });
        router.push('/landlord');
    } catch (e: any) {
        setError(e?.message ?? 'Failed to update listing');
    }
  }

  if (isLoading) return <div className="p-8">Loading listing...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-sand pb-12">
      <TopNav variant="back" title="Edit Listing" />
      <div className="flex-1 px-6 overflow-y-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}
        {property && (
            <PropertyForm 
                initialData={property} 
                onSubmit={handleSubmit} 
                isSubmitting={updateMutation.isPending} 
            />
        )}
      </div>
    </div>
  );
}
