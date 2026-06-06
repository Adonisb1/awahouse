'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const STUB_INSTALMENTS = [
  { id: '1', number: 1, amount: '₦208,333', dueDate: 'Jul 6, 2026', status: 'paid' as const },
  { id: '2', number: 2, amount: '₦208,333', dueDate: 'Aug 6, 2026', status: 'scheduled' as const },
  { id: '3', number: 3, amount: '₦208,333', dueDate: 'Sep 6, 2026', status: 'scheduled' as const },
  { id: '4', number: 4, amount: '₦208,333', dueDate: 'Oct 6, 2026', status: 'scheduled' as const },
];

const STATUS_LABELS: Record<string, string> = {
  paid: 'Paid',
  scheduled: 'Scheduled',
  overdue: 'Overdue',
  missed: 'Missed',
};

const STATUS_BADGE: Record<string, 'fully_verified' | 'title_confirmed' | 'agent_verified' | 'pending'> = {
  paid: 'fully_verified',
  scheduled: 'pending',
  overdue: 'agent_verified',
  missed: 'pending',
};

export default function RentInstalmentsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6">
        <h1 className="font-display text-3xl italic font-black text-charcoal">Instalment Plan</h1>
        <p className="font-body text-charcoal/60">Monthly rent payment schedule</p>
      </div>

      <Card className="mb-6 bg-success-bg border-success">
        <CardContent className="pt-6 flex items-center justify-between">
          <div>
            <p className="font-display text-xl font-bold text-success">1 of 12 paid</p>
            <p className="font-body text-sm text-success/70">Next payment: Aug 6, 2026</p>
          </div>
          <p className="font-display text-2xl font-bold text-success">₦208,333/mo</p>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        {STUB_INSTALMENTS.map((inst) => (
          <Card key={inst.id}>
            <CardContent className="pt-4 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-display text-lg font-bold text-charcoal w-8">
                  {String(inst.number).padStart(2, '0')}
                </span>
                <div>
                  <p className="font-body font-semibold text-charcoal">{inst.amount}</p>
                  <p className="font-body text-sm text-charcoal/40">Due {inst.dueDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={STATUS_BADGE[inst.status]}>
                  {STATUS_LABELS[inst.status]}
                </Badge>
                {inst.status === 'scheduled' && (
                  <Button size="sm">Pay Now</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
