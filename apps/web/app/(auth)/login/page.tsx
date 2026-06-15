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
