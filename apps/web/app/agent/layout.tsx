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
      <main>{children}</main>
    </div>
  );
}
