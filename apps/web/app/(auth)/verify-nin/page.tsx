'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/hooks/useAuthStore';
import { trpc } from '@/lib/trpc/react';

export default function VerifyNinPage() {
  const router = useRouter();
  const roles = useAuthStore((s) => s.roles);
  const [nin, setNin] = useState('');
  const [error, setError] = useState('');

  const { data: statusData, isLoading: statusLoading } = trpc.verification.checkStatus.useQuery();
  const submitMutation = trpc.verification.submitNin.useMutation();

  const ninVerification = statusData?.verifications?.find((v) => v.type === 'nin');
  const status = ninVerification?.status ?? 'not_started';

  async function handleSubmit() {
    if (nin.length !== 11 || !/^\d+$/.test(nin)) {
      setError('NIN must be exactly 11 digits');
      return;
    }
    setError('');
    try {
      await submitMutation.mutateAsync({ nin });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Verification failed. Try again.');
    }
  }

  if (statusLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-surface p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

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

        <button
          onClick={() => {
            if (roles.includes('landlord')) router.push('/landlord');
            else if (roles.includes('agent')) router.push('/agent');
            else router.push('/explore');
          }}
          className="mb-6 w-full text-center text-sm font-medium text-primary hover:underline"
        >
          Skip for now
        </button>

        {(status === 'not_started' || !ninVerification) && (
          <Card>
            <CardContent className="pt-6 flex flex-col gap-4">
              <Input
                label="NIN (11 digits)"
                placeholder="12345678901"
                maxLength={11}
                value={nin}
              onChangeValue={(val) => setNin(val.replace(/\D/g, ''))}
                error={error}
              />
              <Button
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                className="w-full"
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify NIN'
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {(status === 'pending') && (
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="font-body font-medium text-charcoal">NIN Verification</span>
                  <Badge variant="pending">Under review</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center py-4">
                  <Clock className="h-12 w-12 text-orange-400 mb-3" />
                  <p className="font-body text-center text-charcoal/60">
                    Your NIN is being reviewed. This usually takes a few minutes.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Input
              label="NIN (11 digits)"
              placeholder="12345678901"
              maxLength={11}
              value={nin}
onChangeValue={(val) => setNin(val.replace(/\D/g, ''))}
              error={error}
            />
            <Button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="w-full"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Try again'
              )}
            </Button>
          </div>
        )}

        {status === 'approved' && (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="font-body font-medium text-charcoal">NIN Verification</span>
                  <Badge variant="fully_verified">Verified</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center py-4">
                  <CheckCircle className="h-12 w-12 text-success mb-3" />
                  <p className="font-body text-center text-charcoal/60">
                    Your identity has been verified successfully.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={() => router.push(roles.includes('agent') ? '/verify-agent' : roles.includes('landlord') ? '/landlord' : '/explore')}
              className="mt-6 w-full"
            >
              Continue
            </Button>
          </>
        )}

        {status === 'rejected' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="font-body font-medium text-charcoal">NIN Verification</span>
                <Badge variant="pending">Rejected</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center py-4">
                <XCircle className="h-12 w-12 text-red-500 mb-3" />
                <p className="font-body text-center text-charcoal/60">
                  {ninVerification?.metadata &&
                  typeof ninVerification.metadata === 'object' &&
                  'dojahMessage' in ninVerification.metadata
                    ? String(ninVerification.metadata.dojahMessage)
                    : 'Verification was rejected. Please try again with a valid NIN.'}
                </p>
                <Button
                  variant="secondary"
                  className="mt-4"
                  onClick={() => {
                    setNin('');
                    setError('');
                  }}
                >
                  Try again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
