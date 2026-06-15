'use client';

import * as React from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { KoboDisplay } from '@/components/ui/KoboDisplay';
import { EscrowStatusChip, EscrowStatus } from '@/components/escrow/EscrowStatusChip';
import { trpc } from '@/lib/trpc/react';

const STATUS_TABS = [
  { label: 'All', value: undefined },
  { label: 'Active', value: 'funds_held' },
  { label: 'Disputed', value: 'disputed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Refunded', value: 'refunded' },
] as const;

function EscrowTable() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const statusParam = searchParams.get('status') ?? undefined;
  const pageParam = parseInt(searchParams.get('page') ?? '1', 10);

  const { data, isLoading } = trpc.admin.listEscrows.useQuery({
    status: (statusParam as 'pending_payment' | 'funds_held' | 'docs_verified' | 'key_handover_pending' | 'completed' | 'refunded' | 'cancelled' | 'disputed') ?? undefined,
    page: pageParam,
    limit: 20,
  });

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_TABS.map((tab) => {
          const active = tab.value === statusParam || (!tab.value && !statusParam);
          const params = new URLSearchParams(searchParams);
          if (tab.value) params.set('status', tab.value);
          else params.delete('status');
          params.set('page', '1');
          return (
            <Link
              key={tab.label}
              href={`/escrows?${params.toString()}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                active
                  ? 'bg-charcoal-deep text-white'
                  : 'bg-gray-100 text-charcoal/60 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : !data?.items.length ? (
            <div className="py-16 text-center">
              <p className="font-body text-charcoal/40">No escrow transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-charcoal/40 text-xs uppercase tracking-wider">
                    <th className="pb-3 pr-4 font-medium">Ref</th>
                    <th className="pb-3 pr-4 font-medium">Property</th>
                    <th className="pb-3 pr-4 font-medium">Tenant</th>
                    <th className="pb-3 pr-4 font-medium">Landlord</th>
                    <th className="pb-3 pr-4 font-medium text-right">Amount</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Date</th>
                    <th className="pb-3 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((escrow) => (
                    <tr key={escrow.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 pr-4">
                        <span className="font-mono text-xs text-charcoal/60">
                          {escrow.paymentReference ?? escrow.id.slice(0, 8)}
                        </span>
                      </td>
                      <td className="py-3 pr-4 max-w-[180px] truncate font-medium text-charcoal">
                        {escrow.property.title}
                      </td>
                      <td className="py-3 pr-4 text-charcoal/80">
                        {escrow.tenant.firstName ?? escrow.tenant.email}
                      </td>
                      <td className="py-3 pr-4 text-charcoal/80">
                        {escrow.landlord.firstName ?? escrow.landlord.email}
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <KoboDisplay kobo={Number(escrow.amountKobo)} size="sm" />
                      </td>
                      <td className="py-3 pr-4">
                        <EscrowStatusChip status={escrow.status as EscrowStatus} />
                      </td>
                      <td className="py-3 pr-4 text-charcoal/40 text-xs whitespace-nowrap">
                        {new Date(escrow.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td className="py-3">
                        <Link href={`/escrows/${escrow.id}`}>
                          <Button size="sm" variant="secondary">View</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data && data.total > 20 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              <p className="text-sm text-charcoal/40">
                Page {pageParam} of {Math.ceil(data.total / 20)}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={pageParam <= 1}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set('page', String(pageParam - 1));
                    router.push(`/escrows?${params.toString()}`);
                  }}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={pageParam >= Math.ceil(data.total / 20)}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set('page', String(pageParam + 1));
                    router.push(`/escrows?${params.toString()}`);
                  }}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export default function AdminEscrowsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl italic font-black text-charcoal">Escrow Transactions</h1>
        <p className="font-body text-sm text-charcoal/60 mt-1">View and manage all escrows</p>
      </div>
      <Suspense
        fallback={
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            </CardContent>
          </Card>
        }
      >
        <EscrowTable />
      </Suspense>
    </div>
  );
}
