'use client';

import * as React from 'react';
import { trpc } from '@/lib/trpc/react';
import { useAuthStore } from '@/hooks/useAuthStore';

export function SessionSync({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const { data } = trpc.auth.refreshSession.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  React.useEffect(() => {
    if (data?.authenticated && data.userId) {
      setAuth({
        userId: data.userId,
        roles: data.roles as any,
        activeRole: data.activeRole as any,
      });
    } else if (data && !data.authenticated) {
      clearAuth();
    }
  }, [data, setAuth, clearAuth]);

  return <>{children}</>;
}
