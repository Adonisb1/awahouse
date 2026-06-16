'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { AlertCircle, CheckCircle2, Clock, Send } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { TopNav } from '@/components/layout/TopNav';
import { KoboDisplay } from '@/components/ui/KoboDisplay';
import { Button } from '@/components/ui/Button';
import { trpc } from '@/lib/trpc/react';

export default function InstalmentDetailsPage() {
  const params = useParams();
  const escrowId = params.escrowId as string;
  
  const { data: schedule, isLoading } = trpc.rentInstalments.getSchedule.useQuery({ escrowId });
  const utils = trpc.useUtils();
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState('');
  const sendReminders = trpc.rentInstalments.sendInstalmentReminders.useMutation();

  const items = schedule?.items ?? [];
  const overdue = items.filter(s => s.status === 'overdue');
  
  const handleSendReminders = async () => {
    if (overdue.length === 0) return;
    if (confirm(`Send reminders to ${overdue.length} tenant(s) with overdue payments?`)) {
        setSending(true);
        try {
          await sendReminders.mutateAsync({ escrowId });
          utils.rentInstalments.getSchedule.invalidate({ escrowId });
        } catch (e: any) { setError(e?.message ?? 'Failed to send reminders'); }
        setSending(false);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-sand p-8 text-center">Loading schedule...</div>;

  const paidTotal = items.filter(s => s.status === 'paid').reduce((sum, s) => sum + Number(s.amountKobo), 0) || 0;
  const expectedTotal = items.reduce((sum, s) => sum + Number(s.amountKobo), 0) || 0;

  return (
    <div className="min-h-screen bg-sand">
      <TopNav variant="back" title="Payment Schedule" />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Summary Card */}
        <div className="bg-white border border-outline-variant rounded-card p-6 shadow-sm mb-8 flex justify-between items-center">
            <div>
                <p className="text-xs font-mono text-muted uppercase tracking-widest mb-1">Total Revenue</p>
                <div className="flex gap-2 items-baseline">
                    <KoboDisplay kobo={paidTotal} size="lg" color="charcoal" />
                    <span className="text-muted text-sm">/ <KoboDisplay kobo={expectedTotal} size="sm" color="muted" /></span>
                </div>
            </div>
            <Button 
                variant="primary" 
                size="md" 
                disabled={overdue.length === 0}
                onClick={handleSendReminders}
                loading={sending}
            >
                <Send size={16} className="mr-2" /> Remind Overdue ({overdue.length})
            </Button>
        </div>

        {/* Instalment List */}
        <div className="bg-white border border-outline-variant rounded-card overflow-hidden shadow-sm">
            {items.map((item) => (
                <div key={item.id} className="p-4 border-b border-outline-variant/30 flex justify-between items-center last:border-0">
                    <div className="flex items-center gap-4">
                        <div className={cn("p-2 rounded-full", 
                            item.status === 'paid' ? "bg-success-bg text-success" : 
                            item.status === 'overdue' ? "bg-red-50 text-red-600" : "bg-sand text-muted"
                        )}>
                            {item.status === 'paid' ? <CheckCircle2 size={16} /> : 
                             item.status === 'overdue' ? <AlertCircle size={16} /> : <Clock size={16} />}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-charcoal">{new Date(item.dueDate).toLocaleDateString()}</p>
                            <p className="text-[10px] font-mono uppercase text-muted">{item.status}</p>
                        </div>
                    </div>
                    <KoboDisplay kobo={Number(item.amountKobo)} size="md" color="charcoal" />
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
