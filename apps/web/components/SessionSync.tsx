'use client';

import * as React from 'react';
import { trpc } from '@/lib/trpc/react';
import { useAuthStore, type Role } from '@/hooks/useAuthStore';

export function SessionSync({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const pendingRole = useAuthStore((s) => s.pendingRole);

  const [isSyncing, setIsSyncing] = React.useState(false);
  const signInWithGoogle = trpc.auth.signInWithGoogle.useMutation();

  const { data } = trpc.auth.refreshSession.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !isSyncing,
  });

  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token=')) {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.replace(/^#/, '?'));
      const accessToken = params.get('access_token');
      if (accessToken) {
        setIsSyncing(true);
        signInWithGoogle.mutate(
          {
            accessToken,
            role: pendingRole ?? 'tenant',
          },
          {
            onSuccess: (result) => {
              setAuth({
                userId: result.userId,
                roles: result.roles as Role[],
                activeRole: result.activeRole as Role,
              });
              window.history.replaceState(null, '', window.location.pathname + window.location.search);
              setIsSyncing(false);
              window.location.href = '/verify-nin';
            },
            onError: (err) => {
              console.error('Google SSO session sync error:', err);
              window.history.replaceState(null, '', window.location.pathname + window.location.search);
              setIsSyncing(false);
              window.location.href = '/signup?error=auth_failed';
            },
          }
        );
      }
    }
  }, [pendingRole, setAuth, signInWithGoogle]);

  React.useEffect(() => {
    if (isSyncing) return;
    if (data?.authenticated && data.userId) {
      setAuth({
        userId: data.userId,
        roles: data.roles as Role[],
        activeRole: data.activeRole as Role,
      });
    } else if (data && !data.authenticated) {
      clearAuth();
    }
  }, [data, setAuth, clearAuth, isSyncing]);

  if (isSyncing) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-sand p-6">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-terra border-t-transparent" />
          <p className="mt-4 font-mono text-xs text-charcoal/60 uppercase tracking-[0.2em]">
            Authenticating with Google...
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
