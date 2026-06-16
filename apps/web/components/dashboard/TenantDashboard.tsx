'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, ShieldCheck, TrendingUp, Heart, Search, ArrowRight, User as UserIcon, Building, MapPin, Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { TopNav } from '@/components/layout/TopNav';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/Button';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { VerificationBanner } from '@/components/dashboard/VerificationBanner';
import { trpc } from '@/lib/trpc/react';
import Link from 'next/link';

export function TenantDashboardView() {
  const router = useRouter();
  const { data: propertiesData } = trpc.properties.search.useQuery({ limit: 4 });
  const { data: verifications } = trpc.verification.checkStatus.useQuery();

  const hasNinApproved = verifications?.verifications?.some(
    (v: { type: string; status: string }) => v.type === 'nin' && v.status === 'approved',
  );
  const verificationStatus = hasNinApproved ? 'verified' : 'pending';

  return (
    <div className="min-h-screen bg-sand pb-[80px]">
      <TopNav
        variant="brand"
        actions={
          <div className="flex items-center gap-3">
            <NotificationBell />
            <Link 
              href="/profile"
              className="w-10 h-10 rounded-full bg-white border border-outline-variant flex items-center justify-center hover:bg-sand-warm transition-colors"
            >
              <UserIcon size={20} className="text-muted" />
            </Link>
          </div>
        }
      />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <VerificationBanner status={verificationStatus} />

        <div className="mb-10">
            <h2 className="font-playfair text-3xl font-bold text-charcoal mb-2">Find your next home</h2>
            <p className="text-muted text-sm">Verified properties in Lagos</p>
            
            <div className="mt-6 bg-white border border-outline-variant rounded-card p-2 flex items-center shadow-sm">
                <Search className="ml-3 text-muted" size={20} />
                <input 
                    placeholder="Search LGA, area, or property type..."
                    className="flex-1 p-3 outline-none text-sm font-body"
                />
                <Button size="sm">Search</Button>
            </div>
        </div>

        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
             <h3 className="font-display text-lg font-bold text-charcoal">Verified Properties</h3>
             <Button size="sm" variant="ghost" onClick={() => router.push('/explore')}>
                View all <ArrowRight className="h-3 w-3 ml-1" />
             </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             {propertiesData?.properties.map((prop) => (
                <div key={prop.id} className="bg-white border border-outline-variant rounded-card overflow-hidden shadow-sm hover:border-terra transition-colors cursor-pointer" onClick={() => router.push(`/property/${prop.id}`)}>
                    <div className="h-32 bg-sand-warm">
                       {prop.images?.[0] && <img src={prop.images[0].url} alt={prop.title} className="w-full h-full object-cover" />}
                    </div>
                    <div className="p-4">
                        <h4 className="font-bold text-charcoal text-sm truncate mb-1">{prop.title}</h4>
                        <div className="flex items-center gap-1 text-[10px] text-muted font-mono uppercase mb-2">
                            <MapPin size={10} /> {prop.lga}
                        </div>
                        <div className="font-playfair font-bold text-terra-dark text-sm">₦{(Number(prop.priceKobo)/1000000).toFixed(1)}M/yr</div>
                    </div>
                </div>
             ))}
          </div>
        </section>
      </div>
      <BottomNav role="TENANT" />
    </div>
  );
}
