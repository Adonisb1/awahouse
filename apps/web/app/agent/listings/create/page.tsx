'use client';

import * as React from 'react';
import { X, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LGA_LIST } from '@awahouse/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { TopNav } from '@/components/layout/TopNav';
import { trpc } from '@/lib/trpc/react';
import { fileToUploadInput } from '@/lib/utils/fileToBase64';

const TYPES = ['apartment', 'duplex', 'bungalow', 'studio', 'commercial'] as const;

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().max(2000).optional().or(z.literal('')),
  type: z.enum(TYPES),
  priceNaira: z.coerce.number().positive('Price must be positive'),
  bedrooms: z.coerce.number().int().min(0).max(50).default(1),
  bathrooms: z.coerce.number().int().min(0).max(50).default(1),
  lga: z.enum(LGA_LIST, { required_error: 'Select a Local Government Area' }),
  address: z.string().max(500).optional().or(z.literal('')),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function AgentCreateListingPage() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [error, setError] = React.useState('');
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [previews, setPreviews] = React.useState<string[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const createMutation = trpc.properties.create.useMutation({
    onError: (err) => setError(err.message),
  });

  const uploadMutation = trpc.properties.uploadImages.useMutation();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { bedrooms: 1, bathrooms: 1 },
  });
  const values = watch();

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const remaining = 10 - selectedFiles.length;
    const toAdd = files.slice(0, remaining);
    setSelectedFiles(prev => [...prev, ...toAdd]);
    toAdd.forEach(f => {
      const url = URL.createObjectURL(f);
      setPreviews(prev => [...prev, url]);
    });
    if (e.target) e.target.value = '';
  }

  function removeFile(index: number) {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      const url = prev[index];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function onSubmit(data: FormData) {
    setError('');
    try {
      const result = await createMutation.mutateAsync({
        title: data.title,
        description: data.description || undefined,
        type: data.type,
        priceKobo: BigInt(Math.round(data.priceNaira * 100)),
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        lga: data.lga || undefined,
        address: data.address || undefined,
        latitude: data.latitude,
        longitude: data.longitude,
      });

      if (selectedFiles.length > 0) {
        setUploading(true);
        const images = await Promise.all(selectedFiles.map(fileToUploadInput));
        await uploadMutation.mutateAsync({ propertyId: result.id, images });
      }

      utils.properties.listMyProperties.invalidate();
      router.push('/agent/listings');
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create listing');
    } finally {
      setUploading(false);
    }
  }

  const isPending = createMutation.isPending || uploading;

  return (
    <div className="flex flex-col min-h-screen bg-sand">
      <TopNav variant="back" title="New Listing" onBack={() => router.push('/agent')} />

      <div className="mx-auto max-w-2xl w-full px-4 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

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

              <div className="grid grid-cols-2 gap-4">
                <Input label="Latitude" type="number" step="any" placeholder="6.5244" {...register('latitude')} />
                <Input label="Longitude" type="number" step="any" placeholder="3.3792" {...register('longitude')} />
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <label className="font-body text-sm font-medium text-charcoal">Photos (max 10)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="flex flex-wrap gap-3">
                  {previews.map((url, i) => (
                    <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden border border-charcoal/10 group">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ))}
                  {previews.length < 10 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 rounded-lg border-2 border-dashed border-charcoal/20 flex flex-col items-center justify-center gap-1 text-charcoal/40 hover:border-primary hover:text-primary transition-colors"
                    >
                      <Upload className="h-5 w-5" />
                      <span className="text-[10px] font-medium">Upload</span>
                    </button>
                  )}
                </div>
                {selectedFiles.length > 0 && (
                  <p className="text-xs text-charcoal/40">{selectedFiles.length} / 10 selected</p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => router.push('/agent/listings')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} loading={isPending}>
              {uploading ? 'Uploading images...' : 'Create Listing'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
