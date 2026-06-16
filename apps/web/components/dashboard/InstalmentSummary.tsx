'use client';

import * as React from 'react';
import { trpc } from '@/lib/trpc/react';
import { KoboDisplay } from '@/components/ui/KoboDisplay';
import { cn } from '@/lib/utils/cn';

interface InstalmentSummaryProps {
  escrowId: string;
}

export function InstalmentSummary({ escrowId }: InstalmentSummaryProps) {
  const { data: schedule, isLoading } = trpc.rentInstalments.getSchedule.useQuery({ escrowId });

  if (isLoading) return <div className="p-4 bg-white rounded-card animate-pulse h-32" />;

  const items = schedule?.items ?? [];
  if (items.length === 0) return null;

  const paidCount = items.filter(s => s.status === 'paid').length;
  const totalCount = items.length;

  return (
    <div className="bg-white border border-outline-variant rounded-card p-5 shadow-sm">
      <h3 className="font-playfair text-lg font-bold text-charcoal mb-4">Payment Progress</h3>
      
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted">{paidCount} of {totalCount} instalments paid</p>
        <div className="w-full max-w-[100px] h-2 bg-sand rounded-full overflow-hidden">
          <div 
            className="h-full bg-success" 
            style={{ width: `${(paidCount / totalCount) * 100}%` }} 
          />
        </div>
      </div>

      <div className="space-y-2">
        {items.slice(0, 3).map((item) => (
          <div key={item.id} className="flex justify-between items-center text-xs">
            <span className="font-mono text-muted uppercase">{new Date(item.dueDate).toLocaleDateString()}</span>
            <span className={cn("font-bold", item.status === 'paid' ? 'text-success' : 'text-amber-600')}>{item.status}</span>
            <KoboDisplay kobo={Number(item.amountKobo)} size="sm" color="charcoal" />
          </div>
        ))}
      </div>
    </div>
  );
}
