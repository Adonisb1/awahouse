'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TopNav } from '@/components/layout/TopNav';
import { cn } from '@/lib/utils/cn';
import { trpc } from '@/lib/trpc/react';

const professionalBodies = [
  { id: 'lasrera', name: 'LASRERA', description: 'Lagos State Real Estate Regulatory Authority', recommended: true },
  { id: 'esvarbon', name: 'ESVARBON', description: 'Estate Surveyors and Valuers Registration Board of Nigeria' },
  { id: 'niesv', name: 'NIESV', description: 'Nigerian Institution of Estate Surveyors and Valuers' },
  { id: 'aean', name: 'AEAN', description: 'Association of Estate Agents in Nigeria' },
  { id: 'ercaan', name: 'ERCAAN', description: 'Estate and Real estate Consultants Association of Nigeria' },
  { id: 'redan', name: 'REDAN', description: 'Real Estate Developers Association of Nigeria' },
] as const;

export default function VerifyAgentPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const mutation = trpc.verification.submitProfessionalBody.useMutation({
    onSuccess: () => setDone(true),
  });

  async function handleSubmit() {
    if (!selected) return;
    mutation.mutate({ body: selected });
  }

  if (done) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-surface p-6">
        <CheckCircle className="h-16 w-16 text-success mb-4" />
        <h1 className="font-display text-3xl italic font-black text-charcoal text-center">
          Verification submitted
        </h1>
        <p className="mt-2 font-body text-charcoal/60 text-center max-w-sm">
          Your credentials are under review. We&apos;ll notify you once verified.
        </p>
        <Button onClick={() => router.push('/agent/listings')} className="mt-8">
          Done
        </Button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface p-6">
      <TopNav variant="back" title="Verify Agent" onBack={() => router.back()} />

      <div className="mx-auto max-w-md pt-4">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="font-display text-3xl italic font-black text-charcoal">
            Professional body
          </h1>
        </div>
        <p className="font-body text-charcoal/60 mb-8">
          Select your professional real estate body. Only one is required.
        </p>

        {mutation.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
            {mutation.error.message}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {professionalBodies.map((body) => (
            <button
              key={body.id}
              onClick={() => setSelected(body.id)}
              className="text-left"
            >
              <Card
                className={cn(
                  'cursor-pointer transition-all',
                  selected === body.id && 'border-primary ring-2 ring-primary/20',
                )}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-lg font-bold text-charcoal">
                          {body.name}
                        </span>
                        {'recommended' in body && body.recommended && (
                          <Badge variant="fully_verified">Recommended</Badge>
                        )}
                      </div>
                      <p className="mt-1 font-body text-sm text-charcoal/60">{body.description}</p>
                    </div>
                    <div
                      className={cn(
                        'mt-1 flex h-5 w-5 items-center justify-center rounded-full border-2',
                        selected === body.id
                          ? 'border-primary bg-primary'
                          : 'border-charcoal/20',
                      )}
                    >
                      {selected === body.id && (
                        <div className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!selected || mutation.isPending}
          className="mt-8 w-full"
        >
          {mutation.isPending ? 'Submitting...' : 'Submit for verification'}
        </Button>
      </div>
    </main>
  );
}
