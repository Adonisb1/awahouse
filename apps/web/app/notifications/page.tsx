'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Check, Mail, Bell } from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import { TopNav } from '@/components/layout/TopNav';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

export default function NotificationsPage() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [error, setError] = React.useState('');
  
  const { data: notifications, isLoading } = trpc.notifications.list.useQuery({ page: 1, limit: 20 });
  const markReadMutation = trpc.notifications.markRead.useMutation({
    onSuccess: () => utils.notifications.list.invalidate(),
    onError: (err) => setError(err.message),
  });
  const markAllReadMutation = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => utils.notifications.list.invalidate(),
    onError: (err) => setError(err.message),
  });

  const handleMarkRead = (id: string) => {
    markReadMutation.mutate({ id });
  };

  return (
    <div className="min-h-screen bg-sand">
      <TopNav variant="back" title="Notifications" />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="font-playfair text-2xl font-bold text-charcoal">All Notifications</h2>
          {notifications && notifications.items.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => markAllReadMutation.mutate()}>
              Mark all as read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white rounded-card animate-pulse" />)}
          </div>
        ) : notifications && notifications.items.length > 0 ? (
          <div className="space-y-3">
            {notifications.items.map((n) => (
              <div 
                key={n.id} 
                className={cn(
                  "p-4 bg-white border border-outline-variant rounded-card flex gap-4 transition-colors",
                  !n.isRead && "border-terra/30 bg-terra-50/50"
                )}
              >
                <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center text-muted mt-1 shrink-0">
                  <Bell size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-charcoal text-sm mb-1">{n.title}</h4>
                  <p className="text-xs text-muted mb-3">{n.body}</p>
                  {!n.isRead && (
                    <Button variant="ghost" size="sm" className="h-8 px-3 text-terra" onClick={() => handleMarkRead(n.id)}>
                      <Check size={14} className="mr-1" /> Mark as read
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted">No notifications found.</div>
        )}
      </div>
    </div>
  );
}
