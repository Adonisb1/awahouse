'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Settings2, User as UserIcon, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { TopNav } from '@/components/layout/TopNav';
import { BottomNav } from '@/components/layout/BottomNav';
import { PropertyCard } from '@/components/property/PropertyCard';
import { AgentCard } from '@/components/agents/AgentCard';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { trpc } from '@/lib/trpc/react';
import { useAuthStore } from '@/hooks/useAuthStore';

const filterChips = [
  'All Verified',
  'Title ✓',
  'Rent Monthly',
  'Agent Verified',
  'Short Let',
  'Duplex',
];

import { NotificationBell } from '@/components/layout/NotificationBell';

export default function ExplorePage() {
  const router = useRouter();
  const activeRole = useAuthStore((s) => s.activeRole);
  const [activeFilter, setActiveFilter] = React.useState('All Verified');
  const [search, setSearch] = React.useState('');

  const { data: searchResult, isLoading } = trpc.properties.search.useQuery({
    query: search.length > 2 ? search : undefined,
  });
  const { data: agentsData, isLoading: agentsLoading } = trpc.agent.listVerified.useQuery();
  const properties = searchResult?.properties ?? [];
  const agents = agentsData ?? [];

  return (
    <div className="flex flex-col min-h-screen bg-sand pb-[80px]">
      <TopNav
        variant="brand"
        actions={
          <div className="flex gap-2">
            <NotificationBell />
            <button 
              onClick={() => router.push('/profile')}
              className="w-10 h-10 rounded-full bg-white border border-outline-variant flex items-center justify-center text-muted"
            >
              <UserIcon size={20} />
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto">
        {/* Hero Section */}
        <section className="px-4 pt-6 mb-7">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[13px] text-muted mb-1">Good morning 👋</p>
              <h2 className="font-playfair text-2xl font-bold text-charcoal leading-tight">
                Find your next home in <br />
                Lagos with <span className="text-terra italic">Verified Trust</span>
              </h2>
            </div>
            <VerifiedBadge type="nin_verified" size="sm" className="mt-1" />
          </div>
        </section>

        {/* Search & Filter */}
        <section className="px-4 mb-7">
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                type="text"
                placeholder="Search Lekki, Badagry..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-[52px] pl-12 pr-4 rounded-[14px] bg-white border border-outline-variant outline-none focus:border-terra-dark transition-all font-sans text-sm"
              />
            </div>
            <button className="w-[52px] h-[52px] rounded-[14px] bg-white border border-outline-variant flex items-center justify-center text-charcoal active:scale-95 transition-transform">
              <Settings2 size={20} />
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4">
            {filterChips.map((chip) => (
              <button
                key={chip}
                onClick={() => setActiveFilter(chip)}
                className={cn(
                  'px-4 py-2 rounded-chip text-xs font-bold whitespace-nowrap transition-all border',
                  activeFilter === chip
                    ? 'bg-terra text-white border-terra shadow-sm'
                    : 'bg-white text-muted border-outline-variant hover:border-terra/30'
                )}
              >
                {chip}
              </button>
            ))}
          </div>
        </section>

        {/* Horizontal Properties */}
        <section className="mb-8">
          <div className="px-4 flex justify-between items-end mb-4">
            <div>
              <h3 className="font-playfair text-xl font-bold text-charcoal">Verified Near You</h3>
              <p className="text-[12px] text-muted">Hand-picked, confirmed docs</p>
            </div>
            <button className="text-terra font-bold text-xs flex items-center gap-1">
              View all <span className="text-[10px]">›</span>
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto px-4 pb-4 no-scrollbar">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="w-[260px] h-[280px] bg-white rounded-card animate-pulse shadow-sm flex flex-col p-4 gap-4">
                  <div className="w-full h-[160px] bg-sand-warm rounded-xl" />
                  <div className="w-3/4 h-5 bg-sand-warm rounded-full" />
                  <div className="w-1/2 h-4 bg-sand-warm rounded-full" />
                </div>
              ))
            ) : properties && properties.length > 0 ? (
              properties.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  id={prop.id}
                  title={prop.title}
                  lga={prop.lga ?? ''}
                  priceYearlyKobo={Number(prop.priceKobo)}
                  imageUrl={prop.images?.[0]?.signedUrl ?? null}
                  verificationStatus={prop.verificationBadge as any}
                  rating={4.9} // Mock rating for now as it's computed
                  reviewCount={12}
                  isSaved={false}
                  onSave={() => {}}
                  onClick={(id) => router.push(`/property/${id}`)}
                />
              ))
            ) : (
              <div className="w-full py-12 flex flex-col items-center justify-center text-muted">
                 <ShieldCheck size={48} className="opacity-20 mb-4" />
                 <p className="font-bold text-sm">No properties found</p>
              </div>
            )}
          </div>
        </section>

        {/* Escrow Banner */}
        <section className="px-4 mb-8">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="rounded-card bg-gradient-to-br from-charcoal to-terra-dark p-6 text-white shadow-lg relative overflow-hidden group"
          >
            <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
            <div className="relative z-10">
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/60 mb-2 block">
                ✦ PREMIUM FEATURE
              </span>
              <h3 className="font-playfair text-xl font-bold mb-2">
                Stop paying rent <br /> upfront. Pay monthly.
              </h3>
              <p className="text-[12px] text-white/80 mb-5 max-w-[200px] leading-relaxed">
                100% interest-free. Secured with Awahouse Escrow protection.
              </p>
              <button 
                onClick={() => router.push('/escrow')}
                className="h-10 px-5 rounded-button bg-white text-terra-dark font-bold text-xs flex items-center gap-2 active:scale-95 transition-transform"
              >
                <ShieldCheck size={16} />
                Secure with Escrow
              </button>
            </div>
          </motion.div>
        </section>

        {/* Agents List */}
        <section className="px-4 mb-8">
          <div className="flex justify-between items-end mb-4">
            <h3 className="font-playfair text-xl font-bold text-charcoal">Top Vetted Agents</h3>
            <button className="text-terra font-bold text-xs">View all</button>
          </div>
          <div className="space-y-3">
            {agentsLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-[72px] bg-white rounded-card animate-pulse shadow-sm" />
              ))
            ) : agents.length > 0 ? (
              agents.slice(0, 3).map((agent) => (
                <AgentCard
                  key={agent.id}
                  id={agent.id}
                  name={agent.name}
                  firm={agent.firm}
                  avatarUrl={agent.avatarUrl}
                  escrowCount={agent.escrowCount}
                  rating={agent.rating}
                  isOnline={agent.isOnline}
                  professionalBodies={agent.professionalBodies}
                  onMessage={(id) => router.push(`/agents/${id}`)}
                />
              ))
            ) : (
              <div className="bg-white border border-outline-variant rounded-card p-8 text-center text-muted text-sm">
                No verified agents found.
              </div>
            )}
          </div>
        </section>
      </div>

      <BottomNav role={activeRole?.toUpperCase() as any || 'TENANT'} />
    </div>
  );
}
