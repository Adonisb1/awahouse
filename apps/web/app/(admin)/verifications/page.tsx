'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { trpc } from '@/lib/trpc/react';

const STATUS_TABS = [
  { label: 'All', value: undefined },
  { label: 'Pending', value: 'pending' as const },
  { label: 'Approved', value: 'approved' as const },
  { label: 'Rejected', value: 'rejected' as const },
];

export default function AdminVerificationsPage() {
  const [statusFilter, setStatusFilter] = React.useState<string | undefined>(undefined);

  const { data, isLoading } = trpc.admin.listVerifications.useQuery({
    status: statusFilter as 'pending' | 'approved' | 'rejected' | undefined,
    limit: 50,
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl italic font-black text-charcoal">Verifications</h1>
        <p className="font-body text-sm text-charcoal/60 mt-1">Agent NIN, professional body, and property document checks</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_TABS.map((tab) => {
          const active = tab.value === statusFilter || (!tab.value && !statusFilter);
          return (
            <button
              key={tab.label}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                active
                  ? 'bg-charcoal-deep text-white'
                  : 'bg-gray-100 text-charcoal/60 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
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
              <p className="font-body text-charcoal/40">No verifications found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-charcoal/40 text-xs uppercase tracking-wider">
                    <th className="pb-3 pr-4 font-medium">User</th>
                    <th className="pb-3 pr-4 font-medium">Type</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Date</th>
                    <th className="pb-3 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((v) => (
                    <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-charcoal">
                          {v.user.firstName} {v.user.lastName}
                        </p>
                        <p className="text-xs text-charcoal/40">{v.user.email}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="font-mono text-xs uppercase text-charcoal/60">
                          {v.type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={v.status === 'approved' ? 'fully_verified' : v.status === 'rejected' ? 'pending' : 'pending'}>
                          {v.status}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-charcoal/40 text-xs whitespace-nowrap">
                        {new Date(v.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td className="py-3">
                        {v.status === 'pending' && v.documentUrl && (
                          <a
                            href={v.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-terra-dark hover:underline font-medium"
                          >
                            View Doc
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
