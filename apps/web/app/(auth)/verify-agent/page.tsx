'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';

const professionalBodies = [
  { id: 'lasrera', name: 'LASRERA', description: 'Lagos State Real Estate Regulatory Authority', recommended: true },
  { id: 'esvarbon', name: 'ESVARBON', description: 'Estate Surveyors and Valuers Registration Board of Nigeria' },
  { id: 'niesv', name: 'NIESV', description: 'Nigerian Institution of Estate Surveyors and Valuers' },
  { id: 'aean', name: 'AEAN', description: 'Association of Estate Agents in Nigeria' },
  { id: 'ercaan', name: 'ERCAAN', description: 'Estate and Real estate Consultants Association of Nigeria' },
  { id: 'redan', name: 'REDAN', description: 'Real Estate Developers Association of Nigeria' },
] as const;

type SubmitStatus = 'idle' | 'submitting' | 'done';

export default function VerifyAgentPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<SubmitStatus>('idle');

  async function handleSubmit() {
    if (!selected) return;
    setStatus('submitting');
    await new Promise((r) => setTimeout(r, 1500));
    setStatus('done');
  }

  if (status === 'done') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-surface p-6">
        <CheckCircle className="h-16 w-16 text-success mb-4" />
        <h1 className="font-display text-3xl italic font-black text-charcoal text-center">
          Verification submitted
        </h1>
        <p className="mt-2 font-body text-charcoal/60 text-center max-w-sm">
          Your credentials are under review. We&apos;ll notify you once verified.
        </p>
        <Button onClick={() => router.push('/')} className="mt-8">
          Done
        </Button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface p-6">
      <div className="mx-auto max-w-md">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="font-display text-3xl italic font-black text-charcoal">
            Professional body
          </h1>
        </div>
        <p className="font-body text-charcoal/60 mb-8">
          Select your professional real estate body. Only one is required.
        </p>

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
          disabled={!selected || status === 'submitting'}
          className="mt-8 w-full"
        >
          {status === 'submitting' ? 'Submitting...' : 'Submit for verification'}
        </Button>
      </div>
    </main>
  );
}
