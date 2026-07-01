'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { createAnonSupabaseClient } from '@/lib/auth/supabase';
import { trpc } from '@/lib/trpc/react';
import { useAuthStore } from '@/hooks/useAuthStore';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = (searchParams.get('role') ?? 'tenant') as 'tenant' | 'landlord' | 'agent';
  const setAuth = useAuthStore((s) => s.setAuth);
  const syncUser = trpc.auth.syncGoogleUser.useMutation();
  const hasHandled = useRef(false);

  useEffect(() => {
    if (hasHandled.current) return;
    hasHandled.current = true;

    const supabase = createAnonSupabaseClient();
    if (!supabase) {
      router.replace('/signup?error=supabase_not_configured');
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        router.replace('/signup?error=no_session');
        return;
      }

      const user = session.user;

      try {
        const result = await syncUser.mutateAsync({
          email: user.email!,
          firstName: (user.user_metadata?.given_name as string) ?? undefined,
          lastName: (user.user_metadata?.family_name as string) ?? undefined,
          avatarUrl: (user.user_metadata?.avatar_url as string) ?? undefined,
          role,
        });

        setAuth({
          userId: result.userId,
          roles: result.roles,
          activeRole: result.activeRole,
        });

        router.replace('/auth/complete');
      } catch {
        router.replace('/signup?error=sync_failed');
      }
    });
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface p-6">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 font-body text-sm text-charcoal/60">Completing sign in...</p>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen flex-col items-center justify-center bg-surface p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 font-body text-sm text-charcoal/60">Completing sign in...</p>
      </main>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
