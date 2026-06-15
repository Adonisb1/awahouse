'use client';

import * as React from 'react';

import { motion } from 'framer-motion';
import { Share2, Lightbulb, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { trpc } from '@/lib/trpc/react';

function scoreBand(score: number): { label: string; color: string } {
  if (score >= 751) return { label: 'EXCELLENT', color: 'text-success' };
  if (score >= 651) return { label: 'GOOD', color: 'text-terra' };
  if (score >= 501) return { label: 'FAIR', color: 'text-amber-500' };
  return { label: 'NEEDS IMPROVEMENT', color: 'text-red-500' };
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function eventIcon(eventType: string) {
  switch (eventType) {
    case 'on_time_payment':
    case 'escrow_completed':
      return <CheckCircle2 size={12} className="text-success" />;
    case 'late_payment':
      return <AlertCircle size={12} className="text-amber-500" />;
    case 'missed_payment':
    case 'dispute_raised':
      return <XCircle size={12} className="text-red-500" />;
    default:
      return <CheckCircle2 size={12} className="text-charcoal/40" />;
  }
}

function eventLabel(eventType: string): string {
  const labels: Record<string, string> = {
    on_time_payment: 'On Time',
    late_payment: 'Late',
    missed_payment: 'Missed',
    escrow_completed: 'Escrow Done',
    dispute_raised: 'Dispute',
  };
  return labels[eventType] ?? eventType;
}

export default function RentScorePage() {
  const { data: scoreData, isLoading: scoreLoading } = trpc.rentScore.get.useQuery({});
  const { data: historyData, isLoading: historyLoading } = trpc.rentScore.history.useQuery({});
  const { data: overdueData } = trpc.rentInstalments.list.useQuery({ status: 'overdue' });

  const score = scoreData?.score ?? 500;
  const band = scoreBand(score);
  const events = historyData?.items ?? [];
  const overdueCount = overdueData?.items?.length ?? 0;

  return (
    <div className="flex flex-col min-h-screen bg-sand pb-12">
      <TopNav variant="back" title="My RentScore" />

      <div className="flex-1 px-4 py-8 overflow-y-auto">
        {/* Gauge Section */}
        <section className="flex flex-col items-center mb-10">
          {scoreLoading ? (
            <div className="w-64 h-32 flex items-center justify-center">
              <Skeleton className="w-48 h-24" />
            </div>
          ) : (
            <div className="relative w-64 h-32 mb-4">
              <svg className="w-full h-full" viewBox="0 0 100 50">
                <path
                  d="M 10 45 A 40 40 0 0 1 90 45"
                  fill="none"
                  stroke="#DFC0B5"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <motion.path
                  d="M 10 45 A 40 40 0 0 1 90 45"
                  fill="none"
                  stroke="#1A5C30"
                  strokeWidth="8"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: Math.min(score / 850, 1) }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="text-5xl font-mono font-black text-charcoal"
                >
                  {score}
                </motion.span>
                <span className={`text-sm font-bold uppercase tracking-widest ${band.color}`}>
                  {band.label}
                </span>
              </div>
            </div>
          )}
          <p className="text-[10px] font-mono text-muted uppercase tracking-widest">Real-time score</p>
        </section>

        {/* Score Factors */}
        <section className="mb-8">
          <h3 className="font-playfair text-lg font-bold text-charcoal mb-4">Score Factors</h3>
          <div className="space-y-3">
            {[
              { label: 'On-time Payments', pct: score > 700 ? 85 : score > 500 ? 60 : 30, impact: '40%' },
              { label: 'Payment History', pct: score > 700 ? 80 : score > 500 ? 55 : 25, impact: '30%' },
              { label: 'Verification Level', pct: score > 600 ? 90 : 50, impact: '20%' },
              { label: 'Account Activity', pct: events.length > 5 ? 70 : events.length > 0 ? 40 : 10, impact: '10%' },
            ].map((factor) => (
              <div key={factor.label} className="bg-white border border-outline-variant rounded-card p-4 shadow-sm">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-bold text-charcoal">{factor.label}</span>
                  <span className="text-[10px] font-mono text-muted uppercase">{factor.impact}</span>
                </div>
                <div className="h-2 bg-sand-deep rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${factor.pct}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-full bg-terra"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Payment History */}
        <section className="mb-8">
          <h3 className="font-playfair text-lg font-bold text-charcoal mb-4">Payment History</h3>
          {historyLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-card" />)}
            </div>
          ) : events.length === 0 ? (
            <div className="bg-white border border-outline-variant rounded-card p-6 text-center shadow-sm">
              <p className="text-sm text-charcoal/60">No payment events yet</p>
            </div>
          ) : (
            <div className="bg-white border border-outline-variant rounded-card overflow-hidden shadow-sm">
              {events.map((event) => (
                <div key={event.id} className="p-4 flex justify-between items-center border-b border-outline-variant/30 last:border-0">
                  <div>
                    <p className="text-xs font-bold text-charcoal">
                      {formatDate(event.createdAt)} &middot; {event.metadata && typeof event.metadata === 'object' && 'amount' in event.metadata
                        ? `₦${Number((event.metadata as { amount: number }).amount) / 100}`
                        : event.eventType.replace(/_/g, ' ')}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {eventIcon(event.eventType)}
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {eventLabel(event.eventType)}
                      </span>
                      {event.scoreAfter != null && (
                        <span className="text-[10px] text-charcoal/40 ml-1">
                          &rarr; {event.scoreAfter}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`text-[10px] font-mono font-black px-2 py-1 rounded-badge border ${
                    event.delta >= 0
                      ? 'bg-success-bg text-success border-success/20'
                      : 'bg-red-50 text-red-500 border-red-200'
                  }`}>
                    {event.delta >= 0 ? '+' : ''}{event.delta} PTS
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* How to Improve */}
        {overdueCount > 0 && (
          <section className="mb-10">
            <h3 className="font-playfair text-lg font-bold text-charcoal mb-4">How to Improve</h3>
            <div className="p-5 bg-terra-50 border border-terra/20 rounded-card flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-terra shrink-0 shadow-sm">
                <Lightbulb size={20} />
              </div>
              <div>
                <h4 className="font-bold text-terra-dark text-sm mb-1">
                  {overdueCount} overdue {overdueCount === 1 ? 'payment' : 'payments'}
                </h4>
                <p className="text-xs text-terra-dark/70 leading-relaxed">
                  Paying your overdue instalments will boost your score by up to <span className="font-bold">+15 pts</span> each.
                </p>
              </div>
            </div>
          </section>
        )}

        <Button
          variant="secondary"
          size="lg"
          fullWidth
          icon={<Share2 size={20} />}
          className="shadow-sm"
        >
          Share Score with Landlord
        </Button>
      </div>
    </div>
  );
}
