'use client';

import * as React from 'react';

import { motion } from 'framer-motion';
import { Share2, Lightbulb, CheckCircle2 } from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';
import { Button } from '@/components/ui/Button';

export default function RentScorePage() {
  const score = 750;

  return (
    <div className="flex flex-col min-h-screen bg-sand pb-12">
      <TopNav variant="back" title="My RentScore" />

      <div className="flex-1 px-4 py-8 overflow-y-auto">
        {/* Gauge Section */}
        <section className="flex flex-col items-center mb-10">
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
                animate={{ pathLength: score / 1000 }}
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
              <span className="text-sm font-bold text-success uppercase tracking-widest">EXCELLENT</span>
            </div>
          </div>
          <p className="text-[10px] font-mono text-muted uppercase tracking-widest">Last updated today</p>
        </section>

        {/* Score Factors */}
        <section className="mb-8">
          <h3 className="font-playfair text-lg font-bold text-charcoal mb-4">Score Factors</h3>
          <div className="space-y-3">
            {[
              { label: 'On-time Payments', pct: 90, impact: '40%' },
              { label: 'Payment History', pct: 75, impact: '30%' },
              { label: 'Verification Level', pct: 100, impact: '20%' },
              { label: 'Account Age', pct: 45, impact: '10%' },
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
          <div className="bg-white border border-outline-variant rounded-card overflow-hidden shadow-sm">
            {[
              { date: 'Oct 2023', amount: '₦375,000', pts: '+20' },
              { date: 'Sep 2023', amount: '₦375,000', pts: '+20' },
              { date: 'Aug 2023', amount: '₦375,000', pts: '+20' },
            ].map((item, i) => (
              <div key={i} className="p-4 flex justify-between items-center border-b border-outline-variant/30 last:border-0">
                <div>
                  <p className="text-xs font-bold text-charcoal">{item.date} · {item.amount}</p>
                  <div className="flex items-center gap-1.5 text-success mt-1">
                    <CheckCircle2 size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">On Time</span>
                  </div>
                </div>
                <div className="bg-success-bg text-success text-[10px] font-mono font-black px-2 py-1 rounded-badge border border-success/20">
                  {item.pts} PTS
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How to Improve */}
        <section className="mb-10">
          <h3 className="font-playfair text-lg font-bold text-charcoal mb-4">How to Improve</h3>
          <div className="p-5 bg-terra-50 border border-terra/20 rounded-card flex gap-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-terra shrink-0 shadow-sm">
              <Lightbulb size={20} />
            </div>
            <div>
              <h4 className="font-bold text-terra-dark text-sm mb-1">Pay next instalment</h4>
              <p className="text-xs text-terra-dark/70 leading-relaxed">
                Paying your upcoming November rent instalment on time will boost your score by <span className="font-bold">+20 pts</span>.
              </p>
            </div>
          </div>
        </section>

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
