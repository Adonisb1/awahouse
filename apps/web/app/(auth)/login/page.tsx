'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuthStore } from '@/hooks/useAuthStore';
import { trpc } from '@/lib/trpc/react';
import React from 'react';
import { TopNav } from '@/components/layout/TopNav';
import type { Role } from '@awahouse/types';
import { createAnonSupabaseClient } from '@/lib/auth/supabase';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = (searchParams.get('role') ?? 'tenant') as 'tenant' | 'landlord' | 'agent';
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const signInMutation = trpc.auth.signIn.useMutation();

  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setError('');
      const supabase = createAnonSupabaseClient();
      if (!supabase) {
        setError('Google sign-in is currently unavailable');
        setGoogleLoading(false);
        return;
      }
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?role=${role}`,
        },
      });
      if (error) {
        setError(error.message);
        setGoogleLoading(false);
      }
    } catch (err: any) {
      setError(err?.message ?? 'Google sign-in failed');
      setGoogleLoading(false);
    }
  };

  async function handleSignIn() {
    if (!email.includes('@')) {
      setError('Enter a valid email address');
      return;
    }
    if (!password) {
      setError('Enter your password');
      return;
    }
    setError('');
    try {
      const result = await signInMutation.mutateAsync({ email, password });
      setAuth({
        userId: result.userId,
        roles: result.roles as Role[],
        activeRole: result.activeRole as Role,
        sessionToken: result.sessionToken,
      });
      router.replace(result.activeRole === 'admin' ? '/admin/dashboard' : '/explore');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sign in failed');
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-sand">
      <TopNav
        variant="back"
        title="Log In"
        onBack={() => router.back()}
      />

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6">
        <h1 className="font-playfair text-3xl font-bold text-charcoal">
          Welcome back
        </h1>
        <p className="mt-1 font-body text-muted">
          Sign in to continue your journey.
        </p>

        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChangeValue={setEmail}
                error={error}
              />
              <div>
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChangeValue={setPassword}
                  error={error ? '' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="relative float-right -mt-[42px] mr-3 text-muted hover:text-charcoal"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            <Button onClick={handleSignIn} loading={signInMutation.isPending} className="w-full">
              Log In
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-outline-variant" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted font-mono tracking-widest">
                  or
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="lg"
              className="w-full bg-white border border-outline-variant text-charcoal hover:bg-gray-50"
              loading={googleLoading}
              onClick={handleGoogleSignIn}
              icon={
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              }
            >
              Continue with Google
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
