'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/useAuthStore';

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

  return <>{children}</>;
}
