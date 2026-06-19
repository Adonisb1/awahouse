'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuthStore } from '@/hooks/useAuthStore';
import { trpc } from '@/lib/trpc/react';
import React from 'react';
import { TopNav } from '@/components/layout/TopNav';
import type { Role } from '@awahouse/types';

function AdminLoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setActiveRole = useAuthStore((s) => s.setActiveRole);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const signInMutation = trpc.auth.signIn.useMutation();
  const switchRoleMutation = trpc.auth.switchRole.useMutation();

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
      
      // Check if user has admin role
      if (!result.roles.includes('admin')) {
        setError('Unauthorized: Admin access required');
        // We log them out essentially, or just don't proceed
        return;
      }

      // Automatically switch to admin role
      await switchRoleMutation.mutateAsync({ role: 'admin' });

      setAuth({
        userId: result.userId,
        roles: result.roles as Role[],
        activeRole: 'admin',
        sessionToken: result.sessionToken,
      });

      router.replace('/admin/dashboard');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sign in failed');
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-charcoal-deep">
      <TopNav
        variant="brand"
      />

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="font-playfair text-3xl font-bold text-white">
            Admin Portal
          </h1>
          <p className="mt-2 font-body text-white/60">
            Sign in to access the Awahouse control panel.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <Input
                label="Admin Email"
                type="email"
                placeholder="admin@awahouse.com"
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
              <Button onClick={handleSignIn} loading={signInMutation.isPending || switchRoleMutation.isPending} className="w-full">
                Log In as Admin
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}
