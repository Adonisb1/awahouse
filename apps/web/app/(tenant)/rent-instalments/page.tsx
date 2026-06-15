'use client';

import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { KoboDisplay } from '@/components/ui/KoboDisplay';
import { trpc } from '@/lib/trpc/react';

const STATUS_LABELS: Record<string, string> = {
  paid: 'Paid',
  scheduled: 'Scheduled',
  overdue: 'Overdue',
  missed: 'Missed',
};

const STATUS_BADGE_VARIANT: Record<string, 'fully_verified' | 'title_confirmed' | 'agent_verified' | 'pending'> = {
  paid: 'fully_verified',
  scheduled: 'pending',
  overdue: 'agent_verified',
  missed: 'pending',
};

export default function RentInstalmentsPage() {
  const router = useRouter();
  const { data, isLoading } = trpc.rentInstalments.list.useQuery({});
  const { data: escrowsData } = trpc.escrow.list.useQuery({ limit: 50 });

  const instalments = data?.items ?? [];
  const paidCount = instalments.filter(i => i.status === 'paid').length;
  const nextUpcoming = instalments.find(i => i.status === 'scheduled');
  const escrowMap = new Map(
    (escrowsData?.items ?? []).map(e => [e.id, e.property.title]),
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6">
        <h1 className="font-display text-3xl italic font-black text-charcoal">Instalment Plan</h1>
        <p className="font-body text-charcoal/60">Monthly rent payment schedule</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-24 bg-white rounded-card animate-pulse" />
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white rounded-card animate-pulse" />)}
        </div>
      ) : instalments.length > 0 ? (
        <>
          <Card className="mb-6 bg-success-bg border-success">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="font-display text-xl font-bold text-success">
                  {paidCount} of {instalments.length} paid
                </p>
                <p className="font-body text-sm text-success/70">
                  {nextUpcoming
                    ? `Next payment: ${nextUpcoming.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                    : paidCount === instalments.length
                      ? 'All instalments paid'
                      : 'No upcoming payments'}
                </p>
              </div>
              {instalments.length > 0 && (
                <p className="font-display text-2xl font-bold text-success">
                  <KoboDisplay kobo={Number(instalments[0]?.amountKobo ?? 0n)} size="sm" />
                  <span className="text-sm font-body text-success/70">/mo</span>
                </p>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            {instalments.map((inst) => {
              const propertyTitle = escrowMap.get(inst.escrowId);

              return (
                <Card key={inst.id}>
                  <CardContent className="pt-4 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="font-display text-lg font-bold text-charcoal w-8">
                        {String(inst.instalmentNumber).padStart(2, '0')}
                      </span>
                      <div>
                        <p className="font-body font-semibold text-charcoal">
                          <KoboDisplay kobo={Number(inst.amountKobo)} size="sm" />
                        </p>
                        <p className="font-body text-sm text-charcoal/40">
                          Due {inst.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        {propertyTitle && (
                          <p className="font-body text-[11px] text-charcoal/30 mt-0.5">
                            {propertyTitle}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={STATUS_BADGE_VARIANT[inst.status]}>
                        {STATUS_LABELS[inst.status]}
                      </Badge>
                      {inst.status === 'scheduled' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            router.push(`/rent-score`);
                          }}
                        >
                          Pay Now
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-display text-xl font-bold text-charcoal mb-2">No instalment plans</h2>
          <p className="text-sm text-charcoal/60 max-w-xs">
            Instalment plans appear here when a landlord offers monthly rent and you accept.
          </p>
        </div>
      )}
    </div>
  );
}
