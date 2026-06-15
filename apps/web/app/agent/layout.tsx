'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, User } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/hooks/useAuthStore';
import { RoleSwitcher } from '@/components/ui/RoleSwitcher';

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const activeRole = useAuthStore((s) => s.activeRole);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (activeRole !== 'agent') {
      router.replace('/explore');
    }
  }, [isAuthenticated, activeRole, router]);

  if (!isAuthenticated || activeRole !== 'agent') return null;

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-50 border-b border-charcoal/5 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link href="/agent" className="flex items-center gap-2 font-display text-xl italic font-black text-primary">
            <Building2 className="h-5 w-5" />
            Awa
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/agent/profile"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-charcoal/60 transition-colors hover:bg-surface-sand hover:text-charcoal"
              aria-label="Profile"
            >
              <User className="h-5 w-5" />
            </Link>
            <RoleSwitcher />
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
