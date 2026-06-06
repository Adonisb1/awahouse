'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const RECENT_EVENTS = [
  { eventType: 'on_time_payment', delta: 15, scoreAfter: 535, date: '2 days ago' },
  { eventType: 'escrow_completed', delta: 20, scoreAfter: 520, date: '1 week ago' },
  { eventType: 'late_payment', delta: -10, scoreAfter: 500, date: '3 weeks ago' },
];

const EVENT_LABELS: Record<string, string> = {
  on_time_payment: 'On-Time Payment',
  late_payment: 'Late Payment',
  missed_payment: 'Missed Payment',
  escrow_completed: 'Escrow Completed',
  dispute_raised: 'Dispute Raised',
};

export default function RentScorePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6">
        <h1 className="font-display text-3xl italic font-black text-charcoal">RentScore</h1>
        <p className="font-body text-charcoal/60">Your payment reputation score</p>
      </div>

      <Card className="mb-6 bg-gradient-to-br from-primary to-primary-dark text-white">
        <CardContent className="pt-8 pb-8 text-center">
          <p className="font-body text-sm opacity-80 mb-1">Current Score</p>
          <p className="font-display text-6xl italic font-black">500</p>
          <p className="font-body text-sm opacity-80 mt-1">out of 850</p>
          <div className="mt-4 flex justify-center gap-4">
            <div className="text-center">
              <p className="font-body text-2xl font-bold">15</p>
              <p className="font-body text-xs opacity-80">Good</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="font-body text-sm text-charcoal/60">Range</p>
            <p className="font-display text-lg font-bold">300 – 850</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="font-body text-sm text-charcoal/60">Initial</p>
            <p className="font-display text-lg font-bold">500</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="font-body text-sm text-charcoal/60">Events</p>
            <p className="font-display text-lg font-bold">{RECENT_EVENTS.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h2 className="font-display text-xl font-bold text-charcoal mb-4">Score History</h2>
          <div className="flex flex-col gap-3">
            {RECENT_EVENTS.map((event, i) => (
              <div key={i} className="flex items-center justify-between border-b border-surface-warm pb-3 last:border-0">
                <div>
                  <p className="font-body font-semibold text-charcoal">
                    {EVENT_LABELS[event.eventType] ?? event.eventType}
                  </p>
                  <p className="font-body text-sm text-charcoal/40">{event.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-body font-bold ${event.delta >= 0 ? 'text-success' : 'text-red-500'}`}>
                    {event.delta >= 0 ? '+' : ''}{event.delta}
                  </span>
                  <Badge variant={event.delta >= 0 ? 'fully_verified' : 'pending'}>
                    {event.scoreAfter}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
