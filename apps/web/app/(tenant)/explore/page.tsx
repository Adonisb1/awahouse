'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { PropertyCard } from '@/components/property/PropertyCard';
import { LGA_LIST } from '@awahouse/types';

// Stub data for UI demonstration
const STUB_PROPERTIES = [
  {
    id: '1', title: 'Modern 3-Bedroom Apartment in Ikeja', lga: 'Ikeja',
    type: 'apartment', bedrooms: 3, bathrooms: 2, priceKobo: 250000000n,
    verificationBadge: 'fully_verified' as const,
    images: [], owner: { firstName: 'Chidi', lastName: 'Okonkwo' },
  },
  {
    id: '2', title: 'Cozy Studio in Surulere', lga: 'Surulere',
    type: 'studio', bedrooms: 1, bathrooms: 1, priceKobo: 80000000n,
    verificationBadge: 'agent_verified' as const,
    images: [], owner: { firstName: 'Amara', lastName: 'Nwosu' },
  },
  {
    id: '3', title: 'Luxury 4-Bedroom Duplex in Lekki', lga: 'Eti-Osa',
    type: 'duplex', bedrooms: 4, bathrooms: 3, priceKobo: 500000000n,
    verificationBadge: 'fully_verified' as const,
    images: [], owner: { firstName: 'Tunde', lastName: 'Babatunde' },
  },
];

export default function ExplorePage() {
  const [query, setQuery] = useState('');
  const [lga, setLga] = useState('');
  const [loading] = useState(false);

  const filtered = STUB_PROPERTIES.filter((p) => {
    if (query && !p.title.toLowerCase().includes(query.toLowerCase())) return false;
    if (lga && p.lga !== lga) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="font-display text-3xl italic font-black text-charcoal mb-1">Find your home</h1>
      <p className="font-body text-charcoal/60 mb-6">Verified properties across Lagos</p>

      <div className="flex flex-col gap-3 sm:flex-row mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/40" />
          <input
            className="h-11 w-full rounded-lg border border-charcoal/20 bg-white pl-10 pr-4 font-body text-charcoal placeholder:text-charcoal/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Search by title, location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          className="h-11 rounded-lg border border-charcoal/20 bg-white px-4 font-body text-charcoal focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          value={lga}
          onChange={(e) => setLga(e.target.value)}
        >
          <option value="">All LGAs</option>
          {LGA_LIST.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <Button variant="secondary" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-white shadow-card overflow-hidden">
              <Skeleton className="aspect-[4/3] rounded-none" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full py-12 text-center font-body text-charcoal/40">
              No properties found matching your search.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
