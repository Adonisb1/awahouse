'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuthStore } from '@/hooks/useAuthStore';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') ?? 'tenant';
  const setAuth = useAuthStore((s) => s.setAuth);

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSendOtp() {
    if (!phone.startsWith('+234') || phone.length < 13) {
      setError('Enter a valid Nigerian number (+234XXXXXXXXXX)');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await new Promise((r) => setTimeout(r, 800));
      setStep('otp');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const stubUserId = `user-${Math.random().toString(36).slice(2, 9)}`;
      setAuth({ userId: stubUserId, role: role as 'tenant' | 'landlord' | 'agent' });
      router.replace('/onboarding');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-surface p-6">
      <button
        onClick={() => (step === 'phone' ? router.back() : setStep('phone'))}
        className="mb-8 flex items-center gap-2 text-sm text-charcoal/60"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <h1 className="font-display text-3xl italic font-black text-charcoal">
          {step === 'phone' && 'Get started'}
          {step === 'otp' && 'Enter code'}
        </h1>
        <p className="mt-1 font-body text-charcoal/60">
          {step === 'phone' && 'Enter your phone number to receive a code'}
          {step === 'otp' && `We sent a 6-digit code to ${phone}`}
        </p>

        <Card className="mt-8">
          <CardContent className="pt-6">
            {step === 'phone' && (
              <div className="flex flex-col gap-4">
                <Input
                  label="Phone number"
                  placeholder="+2348012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
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
