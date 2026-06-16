'use client';

import * as React from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export function VerificationBanner({ status }: { status: string }) {
  const router = useRouter();
  
  if (status === 'verified') return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-card p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
          <AlertCircle size={20} />
        </div>
        <div>
          <h4 className="font-bold text-amber-900">Account verification pending</h4>
          <p className="text-sm text-amber-800">
            {status === 'pending' 
              ? 'Your documents are under review. You cannot create listings until approved.' 
              : 'Your verification was rejected. Please review your documents and resubmit.'}
          </p>
        </div>
      </div>
      <Button 
        variant="secondary" 
        size="sm" 
        onClick={() => router.push('/verify-agent')}
        className="whitespace-nowrap"
      >
        View Status <ArrowRight size={16} className="ml-2" />
      </Button>
    </div>
  );
}
