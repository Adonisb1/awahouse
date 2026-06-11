'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LGA_LIST } from '@awahouse/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';

const TYPES = ['apartment', 'duplex', 'bungalow', 'studio', 'commercial'] as const;

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().max(2000).optional().or(z.literal('')),
  type: z.enum(TYPES),
  priceNaira: z.coerce.number().positive('Price must be positive'),
  bedrooms: z.coerce.number().int().min(0).max(50).default(1),
  bathrooms: z.coerce.number().int().min(0).max(50).default(1),
  lga: z.string().min(1, 'Select a Local Government Area'),
  address: z.string().max(500).optional().or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

export default function NewListingPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { bedrooms: 1, bathrooms: 1 },
  });
  const values = watch();

  async function onSubmit(data: FormData) {
    setSubmitting(true);
    const priceKobo = BigInt(Math.round(data.priceNaira * 100));
    const listing = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description || null,
      type: data.type,
      priceKobo,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      lga: data.lga,
      address: data.address || null,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem('awa-listings') ?? '[]');
    existing.push(listing);
    localStorage.setItem('awa-listings', JSON.stringify(existing));

    await new Promise((r) => setTimeout(r, 500));
    setSubmitting(false);
    router.push('/landlord/listings');
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-sm text-charcoal/60"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <h1 className="font-display text-3xl italic font-black text-charcoal mb-1">New Listing</h1>
      <p className="font-body text-charcoal/60 mb-8">List a new property for rent or sale</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <Card>
          <CardContent className="pt-6 flex flex-col gap-4">
            <Input
              label="Title"
              placeholder="e.g. Modern 3-Bedroom Apartment"
              error={errors.title?.message}
              value={values.title ?? ''}
              {...register('title')}
            />

            <div className="flex flex-col gap-1.5">
              <label className="font-body text-sm font-medium text-charcoal">Description</label>
              <textarea
                className="h-28 w-full rounded-lg border border-charcoal/20 bg-white px-4 py-3 font-body text-charcoal placeholder:text-charcoal/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                placeholder="Describe your property..."
                {...register('description')}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-sm font-medium text-charcoal">Type</label>
                <select
                  className="h-11 rounded-lg border border-charcoal/20 bg-white px-4 font-body text-charcoal focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  {...register('type')}
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
                {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-body text-sm font-medium text-charcoal">LGA</label>
                <select
                  className="h-11 rounded-lg border border-charcoal/20 bg-white px-4 font-body text-charcoal focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  {...register('lga')}
                >
                  <option value="">Select LGA</option>
                  {LGA_LIST.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
                {errors.lga && <p className="text-sm text-red-500">{errors.lga.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Price (₦)"
                type="number"
                placeholder="2500000"
                error={errors.priceNaira?.message}
                value={values.priceNaira ?? ''}
                {...register('priceNaira')}
              />
              <Input
                label="Bedrooms"
                type="number"
                min={0}
                max={50}
                error={errors.bedrooms?.message}
                value={values.bedrooms?.toString() ?? ''}
                {...register('bedrooms')}
              />
              <Input
                label="Bathrooms"
                type="number"
                min={0}
                max={50}
                error={errors.bathrooms?.message}
                value={values.bathrooms?.toString() ?? ''}
                {...register('bathrooms')}
              />
            </div>

            <Input
              label="Address"
              placeholder="Street, building name..."
              error={errors.address?.message}
              value={values.address ?? ''}
              {...register('address')}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Listing'}
          </Button>
        </div>
      </form>
    </div>
  );
}
