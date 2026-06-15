'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';
import { Card, CardContent } from '@/components/ui/Card';
import { EscrowStatusChip } from '@/components/escrow/EscrowStatusChip';
import { KoboDisplay } from '@/components/ui/KoboDisplay';
import { trpc } from '@/lib/trpc/react';

export default function AgentEscrowPage() {
  const router = useRouter();
  const { data, isLoading } = trpc.escrow.list.useQuery({ limit: 50 });

  return (
    <div className="flex flex-col min-h-screen bg-sand">
      <TopNav variant="back" title="My Escrows" onBack={() => router.push('/agent')} />

      <div className="flex-1 px-4 py-6 max-w-4xl mx-auto w-full">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />)}
          </div>
        ) : !data?.items.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-display text-xl font-bold text-charcoal mb-2">No escrows yet</h2>
            <p className="text-sm text-charcoal/60 max-w-xs">
              Escrow transactions you&apos;re involved in will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.items.map((escrow) => (
              <Card
                key={escrow.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/escrow/${escrow.id}`)}
              >
                <CardContent className="pt-5 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-charcoal truncate">
                      {escrow.property.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-charcoal/50">{escrow.property.lga}</span>
                      <EscrowStatusChip status={escrow.status as any} size="sm" />
                    </div>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <KoboDisplay kobo={Number(escrow.amountKobo)} size="sm" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
