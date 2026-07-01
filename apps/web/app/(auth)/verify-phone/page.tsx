'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Smartphone, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { trpc } from '@/lib/trpc/react';

export default function VerifyPhonePage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+234');
  const [otpCode, setOtpCode] = useState('');
  const [stage, setStage] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');

  const { data: profile } = trpc.auth.getProfile.useQuery();
  const sendPhoneOtpMutation = trpc.auth.sendPhoneOtp.useMutation();
  const verifyPhoneOtpMutation = trpc.auth.verifyPhoneOtp.useMutation();

  const fullPhone = phone ? `${countryCode}${phone.replace(/\D/g, '')}` : '';

  const COUNTRIES = [
    { code: '+234', label: '🇳🇬 Nigeria (+234)' },
    { code: '+1', label: '🇺🇸 USA/Canada (+1)' },
    { code: '+44', label: '🇬🇧 UK (+44)' },
    { code: '+254', label: '🇰🇪 Kenya (+254)' },
    { code: '+27', label: '🇿🇦 South Africa (+27)' },
    { code: '+971', label: '🇦🇪 UAE (+971)' },
  ] as const;

  async function handleSendOtp() {
    if (!phone || phone.length < 7) {
      setError('Enter a valid phone number');
      return;
    }
    setError('');
    try {
      await sendPhoneOtpMutation.mutateAsync({ phone: fullPhone });
      setStage('otp');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to send code');
    }
  }

  async function handleVerify() {
    if (otpCode.length !== 6) {
      setError('Enter the 6-digit code');
      return;
    }
    setError('');
    try {
      await verifyPhoneOtpMutation.mutateAsync({ phone: fullPhone, code: otpCode });
      router.replace('/profile');
      router.push('/profile');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Verification failed');
    }
  }

  if (profile?.phoneVerified && profile?.phone) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-surface p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="h-6 w-6 text-success" />
            <h1 className="font-display text-3xl italic font-black text-charcoal">Phone Verified</h1>
          </div>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted mb-6">Your phone number <strong>{profile.phone}</strong> is already verified.</p>
              <Button onClick={() => router.push('/profile')} fullWidth>Back to Profile</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-2">
          <Smartphone className="h-6 w-6 text-primary" />
          <h1 className="font-display text-3xl italic font-black text-charcoal">
            {stage === 'phone' ? 'Verify your phone' : 'Enter the code'}
          </h1>
        </div>
        <p className="text-muted mb-8">
          {stage === 'phone'
            ? 'We\'ll send a verification code to your phone number.'
            : `A 6-digit code was sent to ${fullPhone}.`}
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {stage === 'phone' ? (
          <Card>
            <CardContent className="pt-6 flex flex-col gap-4">
              <div className="space-y-1.5">
                <label className="block font-mono text-[11px] uppercase tracking-widest text-muted mb-1.5">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="h-[52px] px-4 rounded-input border border-outline-variant bg-sand/30 font-sans font-bold text-charcoal text-sm w-[120px] flex-shrink-0"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                  <Input
                    placeholder="803 000 0000"
                    value={phone}
                    onChangeValue={(val) => setPhone(val.replace(/\D/g, ''))}
                    className="flex-1"
                  />
                </div>
              </div>
              <Button
                onClick={handleSendOtp}
                loading={sendPhoneOtpMutation.isPending}
                fullWidth
              >
                Send Verification Code
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6 flex flex-col gap-4">
              <Input
                label="6-digit code"
                placeholder="000000"
                maxLength={6}
                value={otpCode}
                onChangeValue={setOtpCode}
                className="text-center text-2xl tracking-[0.5em] font-mono h-[64px]"
              />
              <Button
                onClick={handleVerify}
                loading={verifyPhoneOtpMutation.isPending}
                disabled={otpCode.length !== 6}
                fullWidth
              >
                Verify & Save
              </Button>
              <button
                onClick={() => { setStage('phone'); setOtpCode(''); setError(''); }}
                className="w-full text-center text-sm font-bold text-muted hover:text-primary"
              >
                ← Change phone number
              </button>
              <button
                onClick={handleSendOtp}
                disabled={sendPhoneOtpMutation.isPending}
                className="w-full text-center text-sm font-bold text-muted hover:text-primary"
              >
                Resend code
              </button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
