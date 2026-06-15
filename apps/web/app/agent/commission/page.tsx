'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp } from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card, CardContent } from '@/components/ui/Card';
import { KoboDisplay } from '@/components/ui/KoboDisplay';
import { trpc } from '@/lib/trpc/react';

export default function CommissionPage() {
  const router = useRouter();
  const { data: stats } = trpc.agent.getDashboardStats.useQuery();
  const { data, isLoading } = trpc.escrow.list.useQuery({ limit: 50 });
  const completedEscrows = (data?.items ?? []).filter(e => e.status === 'completed');

  return (
    <div className="flex flex-col min-h-screen bg-sand">
      <TopNav variant="back" title="Commission" onBack={() => router.push('/agent')} />

      <div className="flex-1 px-4 py-6 max-w-4xl mx-auto w-full">
        {stats && (
          <Card className="mb-6 bg-success-bg border-success">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="font-display text-xl font-bold text-success">
                  Total Commission
                </p>
                <p className="font-body text-sm text-success/70">
                  From {stats.completedEscrows} completed escrow{stats.completedEscrows !== 1 ? 's' : ''}
                </p>
              </div>
              <p className="font-display text-3xl font-bold text-success">
                <KoboDisplay kobo={Number(stats.totalCommissionKobo)} size="display" />
              </p>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />)}
          </div>
        ) : completedEscrows.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-charcoal/60 mb-2">
              {completedEscrows.length} completed escrow{completedEscrows.length !== 1 ? 's' : ''}
            </p>
            {completedEscrows.map((escrow) => (
              <Card key={escrow.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-5 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-charcoal truncate">
                      {escrow.property.title}
                    </p>
                    <p className="text-xs text-charcoal/50 mt-0.5">
                      {escrow.property.lga}
                    </p>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <p className="text-[10px] font-mono text-muted uppercase">Fee earned</p>
                    <KoboDisplay kobo={Number(escrow.platformFeeKobo ?? 0n)} size="sm" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-display text-xl font-bold text-charcoal mb-2">No commission yet</h2>
            <p className="text-sm text-charcoal/60 max-w-xs">
              Commission from completed escrows will appear here.
            </p>
          </div>
        )}
      </div>
      <BottomNav role="AGENT" />
    </div>
  );
}
