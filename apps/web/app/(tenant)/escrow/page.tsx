'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { KoboDisplay } from '@/components/ui/KoboDisplay';
import { Skeleton } from '@/components/ui/Skeleton';
import { BottomNav, type UserRole } from '@/components/layout/BottomNav';
import { trpc } from '@/lib/trpc/react';
import { useAuthStore, type Role } from '@/hooks/useAuthStore';
import Link from 'next/link';
import { TopNav } from '@/components/layout/TopNav';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

const STATUS_BADGE: Record<string, 'fully_verified' | 'title_confirmed' | 'agent_verified' | 'pending'> = {
  pending_payment: 'pending',
  funds_held: 'pending',
  docs_verified: 'agent_verified',
  key_handover_pending: 'title_confirmed',
  completed: 'fully_verified',
  disputed: 'pending',
  refunded: 'pending',
  cancelled: 'pending',
};

const STATUS_LABEL: Record<string, string> = {
  pending_payment: 'Pending Payment',
  funds_held: 'Funds Held',
  docs_verified: 'Docs Verified',
  key_handover_pending: 'Awaiting Handover',
  completed: 'Completed',
  disputed: 'Disputed',
  refunded: 'Refunded',
  cancelled: 'Cancelled',
};

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function EscrowDashboardPage() {
  const router = useRouter();
  const activeRole = useAuthStore((s) => s.activeRole);
  const { data, isLoading } = trpc.escrow.list.useQuery({});
  const escrows = data?.items ?? [];

  return (
    <div className="flex flex-col min-h-screen bg-sand pb-[80px]">
      <TopNav
        variant="brand"
        actions={
          <div className="flex gap-2">
            <NotificationBell />
            <Link 
              href="/profile"
              className="w-10 h-10 rounded-full bg-white border border-outline-variant flex items-center justify-center text-muted active:scale-95 transition-transform"
            >
              <UserIcon size={20} />
            </Link>
          </div>
        }
      />
      <div className="flex-1 mx-auto max-w-4xl w-full px-4 py-6">
        <div className="mb-6">
          <h1 className="font-display text-3xl italic font-black text-charcoal">My Escrows</h1>
          <p className="font-body text-charcoal/60">Track your property transactions</p>
        </div>

        <div className="flex flex-col gap-3">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-card p-6 shadow-sm border border-outline-variant">
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </>
          ) : escrows.length === 0 ? (
            <div className="bg-white rounded-card p-8 text-center border border-outline-variant shadow-sm">
              <p className="font-body text-charcoal/60">No escrow transactions yet</p>
              <Link
                href="/explore"
                className="inline-block mt-3 text-sm font-bold text-terra hover:underline"
              >
                Explore properties
              </Link>
            </div>
          ) : (
            escrows.map((escrow) => (
              <Link key={escrow.id} href={`/escrow/${escrow.id}`}>
                <Card className="hover:shadow-card transition-shadow cursor-pointer">
                  <CardContent className="pt-6 flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-lg font-bold text-charcoal">{escrow.property.title}</h3>
                      <p className="font-body text-sm text-charcoal/60">
                        {escrow.property.lga} &middot; <KoboDisplay kobo={Number(escrow.amountKobo)} />
                      </p>
                      <p className="font-body text-xs text-charcoal/40">{timeAgo(escrow.createdAt)}</p>
                    </div>
                    <Badge variant={STATUS_BADGE[escrow.status] ?? 'pending'}>
                      {STATUS_LABEL[escrow.status] ?? escrow.status}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>

      <BottomNav role={(activeRole?.toUpperCase() ?? 'TENANT') as UserRole} />
    </div>
  );
}
