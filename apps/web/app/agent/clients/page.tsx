'use client';

import { useRouter } from 'next/navigation';
import { Users, Home } from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';
import { BottomNav } from '@/components/layout/BottomNav';
import { trpc } from '@/lib/trpc/react';

export default function AgentClientsPage() {
  const router = useRouter();
  const { data: escrowsData, isLoading } = trpc.escrow.list.useQuery({ limit: 50 });
  const escrows = escrowsData?.items ?? [];
  const completedEscrows = escrows.filter(e => e.status === 'completed');

  const clientMap = new Map<string, { count: number; properties: string[] }>();
  for (const e of completedEscrows) {
    const entry = clientMap.get(e.tenantId) ?? { count: 0, properties: [] };
    entry.count++;
    entry.properties.push(e.property.title);
    clientMap.set(e.tenantId, entry);
  }

  return (
    <div className="flex flex-col min-h-screen bg-sand">
      <TopNav variant="back" title="Clients" onBack={() => router.push('/agent')} />

      <div className="flex-1 px-4 py-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white rounded-card animate-pulse shadow-sm" />)}
          </div>
        ) : completedEscrows.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-charcoal/60 mb-4">
              {clientMap.size} client{clientMap.size !== 1 ? 's' : ''} &middot; {completedEscrows.length} completed escrow{completedEscrows.length !== 1 ? 's' : ''}
            </p>
            {Array.from(clientMap.entries()).map(([tenantId, data]) => (
              <div key={tenantId} className="bg-white border border-outline-variant rounded-card p-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-terra/10 flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-terra-dark" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-charcoal truncate">
                      Client
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <Home size={12} />
                      <span className="truncate">{data.properties[0]}{data.properties.length > 1 ? ` +${data.properties.length - 1} more` : ''}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-success font-bold uppercase tracking-wider mt-1">
                      {data.count} escrow{data.count !== 1 ? 's' : ''} completed
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-display text-xl font-bold text-charcoal mb-2">Your Clients</h2>
            <p className="text-sm text-charcoal/60 max-w-xs">
              Clients you&apos;ve worked with will appear here once you complete transactions.
            </p>
          </div>
        )}
      </div>
      <BottomNav role="AGENT" />
    </div>
  );
}
