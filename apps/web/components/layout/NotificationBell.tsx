'use client';

import * as React from 'react';
import { Bell } from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import { useRouter } from 'next/navigation';

export function NotificationBell() {
  const router = useRouter();
  const { data: unreadData } = trpc.notifications.unreadCount.useQuery(undefined, {
    refetchInterval: 10000, // Poll every 10 seconds
  });

  const hasUnread = (unreadData?.count ?? 0) > 0;

  return (
    <button 
      onClick={() => router.push('/notifications')}
      className="w-10 h-10 rounded-full bg-white border border-outline-variant flex items-center justify-center text-muted relative active:scale-95 transition-transform"
    >
      <Bell size={20} />
      {hasUnread && (
        <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-terra rounded-full border-2 border-white" />
      )}
    </button>
  );
}
