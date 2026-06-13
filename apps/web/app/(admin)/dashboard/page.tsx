'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { KoboDisplay } from '@/components/ui/KoboDisplay';
import { trpc } from '@/lib/trpc/react';
import { ArrowRight, ArrowUpRight, Activity, CheckCircle, Clock } from 'lucide-react';

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = trpc.admin.getStats.useQuery({});
  const { data: disputesData } = trpc.admin.listEscrows.useQuery({ status: 'disputed', limit: 5 });
  const { data: verificationsData } = trpc.admin.listVerifications.useQuery({ status: 'pending', limit: 10 });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl italic font-black text-charcoal">Admin Dashboard</h1>
        <p className="font-body text-sm text-charcoal/60 mt-1">Operations &amp; verification management</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="font-body text-xs text-charcoal/40 uppercase tracking-wider">Total Escrows</p>
              <Activity className="h-4 w-4 text-charcoal/20" />
            </div>
            <p className="font-display text-2xl font-bold text-charcoal">
              {isLoading ? '...' : stats?.totalEscrows ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="font-body text-xs text-charcoal/40 uppercase tracking-wider">Completed</p>
              <CheckCircle className="h-4 w-4 text-success" />
            </div>
            <p className="font-display text-2xl font-bold text-success">
              {isLoading ? '...' : stats?.completedCount ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="font-body text-xs text-charcoal/40 uppercase tracking-wider">Pending Verifications</p>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <p className="font-display text-2xl font-bold text-amber-600">
              {isLoading ? '...' : stats?.pendingVerifications ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="font-body text-xs text-charcoal/40 uppercase tracking-wider">Revenue</p>
              <ArrowUpRight className="h-4 w-4 text-charcoal/20" />
            </div>
            {isLoading ? (
              <p className="font-display text-2xl font-bold text-charcoal">...</p>
            ) : (
              <KoboDisplay kobo={Number(stats?.totalRevenue ?? 0n)} size="lg" />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-charcoal">Pending Verifications</h2>
              <Link href="/verifications">
                <Button size="sm" variant="ghost" icon={<ArrowRight className="h-3 w-3" />}>
                  View all
                </Button>
              </Link>
            </div>
            {verificationsData?.items.length ? (
              <div className="flex flex-col gap-3">
                {verificationsData.items.map((v) => (
                  <div key={v.id} className="flex items-center justify-between border-b border-surface-warm pb-3 last:border-0">
                    <div>
                      <p className="font-body font-semibold text-charcoal text-sm">
                        {v.type.replace(/_/g, ' ')} — {v.user.firstName ?? v.user.email}
                      </p>
                      <p className="font-body text-xs text-charcoal/40 mt-0.5">
                        {new Date(v.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short',
                        })}
                      </p>
                    </div>
                    <Badge variant="pending">Pending</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-charcoal/40 py-4 text-center">No pending verifications</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-charcoal">Open Disputes</h2>
              <Link href="/escrows?status=disputed">
                <Button size="sm" variant="ghost" icon={<ArrowRight className="h-3 w-3" />}>
                  View all
                </Button>
              </Link>
            </div>
            {disputesData?.items.length ? (
              <div className="flex flex-col gap-3">
                {disputesData.items.map((d) => (
                  <div key={d.id} className="flex items-center justify-between border-b border-surface-warm pb-3 last:border-0">
                    <div>
                      <p className="font-body font-semibold text-charcoal text-sm">
                        {d.paymentReference ?? d.id.slice(0, 8)}
                      </p>
                      <p className="font-body text-xs text-charcoal/60 mt-0.5">
                        {d.tenant.firstName ?? d.tenant.email} vs {d.landlord.firstName ?? d.landlord.email}
                      </p>
                    </div>
                    <Link href={`/escrows/${d.id}`}>
                      <Button size="sm" variant="secondary">Resolve</Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-charcoal/40 py-4 text-center">No open disputes</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
