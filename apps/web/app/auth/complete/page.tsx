'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/hooks/useAuthStore';
import { trpc } from '@/lib/trpc/react';

export default function AuthCompletePage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data: profile, isLoading } = trpc.auth.getProfile.useQuery(undefined, {
    retry: 3,
    retryDelay: 1000,
  });

  useEffect(() => {
    if (isLoading) return;
    if (!profile) {
      router.replace('/role');
      return;
    }
    if (!isAuthenticated) {
      setAuth({
        userId: profile.id,
        roles: profile.roles,
        activeRole: profile.activeRole ?? profile.roles[0] ?? 'tenant',
      });
    }
    if (profile.roles.includes('agent')) {
      router.replace('/verify-nin');
    } else if (profile.roles.includes('landlord')) {
      router.replace('/verify-nin');
    } else {
      router.replace('/verify-nin');
    }
  }, [profile, isLoading, isAuthenticated, setAuth, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface p-6">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 font-body text-sm text-charcoal/60">Completing sign in...</p>
    </main>
  );
}
