'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/hooks/useAuthStore';

type VerificationStatus = 'not_started' | 'submitting' | 'pending' | 'approved' | 'rejected';

export default function VerifyNinPage() {
  const router = useRouter();
  const role = useAuthStore((s) => s.role);
  const [nin, setNin] = useState('');
  const [status, setStatus] = useState<VerificationStatus>('not_started');
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (nin.length !== 11 || !/^\d+$/.test(nin)) {
      setError('NIN must be exactly 11 digits');
      return;
    }
    setError('');
    setStatus('submitting');

    await new Promise((r) => setTimeout(r, 1500));
    setStatus('pending');
  }

  const statusConfig = {
    not_started: { label: 'Not started', color: 'default' as const },
    submitting: { label: 'Submitting...', color: 'pending' as const },
    pending: { label: 'Under review', color: 'pending' as const },
    approved: { label: 'Verified', color: 'fully_verified' as const },
    rejected: { label: 'Rejected', color: 'pending' as const },
  };

  return (
    <main className="flex min-h-screen flex-col bg-surface p-6">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="font-display text-3xl italic font-black text-charcoal">
            Verify your NIN
          </h1>
        </div>
        <p className="font-body text-charcoal/60 mb-8">
          Your National Identification Number is required for all users.
        </p>

        {status === 'not_started' || status === 'submitting' ? (
          <Card>
            <CardContent className="pt-6 flex flex-col gap-4">
              <Input
                label="NIN (11 digits)"
                placeholder="12345678901"
                maxLength={11}
                value={nin}
                onChange={(e) => setNin(e.target.value.replace(/\D/g, ''))}
                error={error}
              />
              <Button onClick={handleSubmit} disabled={status === 'submitting'} className="w-full">
                {status === 'submitting' ? 'Verifying...' : 'Verify NIN'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="font-body font-medium text-charcoal">NIN Verification</span>
                <Badge variant={statusConfig[status].color}>{statusConfig[status].label}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center py-4">
                {status === 'pending' && <Clock className="h-12 w-12 text-orange-400 mb-3" />}
                {status === 'approved' && <CheckCircle className="h-12 w-12 text-success mb-3" />}
                {status === 'rejected' && <XCircle className="h-12 w-12 text-red-500 mb-3" />}
                {status === 'pending' && (
                  <>
                    <p className="font-body text-center text-charcoal/60">
                      Your NIN is being reviewed. This usually takes a few minutes.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setStatus('not_started')}
                    >
                      Try again
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {role === 'agent' && status === 'pending' && (
          <div className="mt-6 text-center">
            <p className="font-body text-sm text-charcoal/40 mb-2">
              NIN verified? Next, verify your professional body.
            </p>
            <Button
              variant="ghost"
              onClick={() => router.push('/verify-agent')}
            >
              Continue to professional verification
            </Button>
          </div>
        )}

        {status === 'approved' && (
          <Button onClick={() => router.push('/verify-agent')} className="mt-6 w-full">
            Continue
          </Button>
        )}
      </div>
    </main>
  );
}
