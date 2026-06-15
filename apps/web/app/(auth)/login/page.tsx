'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuthStore } from '@/hooks/useAuthStore';
import { trpc } from '@/lib/trpc/react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = (searchParams.get('role') ?? 'tenant') as 'tenant' | 'landlord' | 'agent';
  const setAuth = useAuthStore((s) => s.setAuth);

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const sendOtpMutation = trpc.auth.sendOtp.useMutation();
  const verifyOtpMutation = trpc.auth.verifyOtp.useMutation();

  async function handleSendOtp() {
    if (!email.includes('@')) {
      setError('Enter a valid email address');
      return;
    }
    setError('');
    try {
      await sendOtpMutation.mutateAsync({ email, role });
      setStep('otp');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to send code');
    }
  }

  async function handleVerifyOtp() {
    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }
    setError('');
    try {
      const result = await verifyOtpMutation.mutateAsync({ email, code: otp, role });
      setAuth({ userId: result.userId, roles: result.roles, activeRole: result.activeRole, sessionToken: result.sessionToken });
      router.replace('/verify-nin');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Invalid code');
    }
  }

  const loading = sendOtpMutation.isPending || verifyOtpMutation.isPending;

  return (
    <main className="flex min-h-screen flex-col bg-surface p-6">
      <button
        onClick={() => (step === 'email' ? router.back() : setStep('email'))}
        className="mb-8 flex items-center gap-2 text-sm text-charcoal/60"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <h1 className="font-display text-3xl italic font-black text-charcoal">
          {step === 'email' && 'Get started'}
          {step === 'otp' && 'Enter code'}
        </h1>
        <p className="mt-1 font-body text-charcoal/60">
          {step === 'email' && 'Enter your email to receive a code'}
          {step === 'otp' && `We sent a 6-digit code to ${email}`}
        </p>

        <Card className="mt-8">
          <CardContent className="pt-6">
            {step === 'email' && (
              <div className="flex flex-col gap-4">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                   onChangeValue={setEmail}
                  error={error}
                />
                <Button onClick={handleSendOtp} disabled={loading} className="w-full">
                  {loading ? 'Sending...' : 'Send code'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {step === 'otp' && (
              <div className="flex flex-col gap-4">
                <Input
                  label="6-digit code"
                  placeholder="000000"
                  maxLength={6}
                  value={otp}
                     onChangeValue={(val) => setOtp(val.replace(/\D/g, ''))}
                  error={error}
                />
                <Button onClick={handleVerifyOtp} disabled={loading} className="w-full">
                  {loading ? 'Verifying...' : 'Verify'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
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
