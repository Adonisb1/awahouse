'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const slides = [
  {
    icon: Shield,
    title: 'Verified Properties',
    description: 'Every property on Awa goes through multi-layer verification. No more fake listings.',
  },
  {
    icon: Lock,
    title: 'Escrow Protection',
    description: 'Your rent is held securely until you confirm possession. Funds released only when you\'re satisfied.',
  },
  {
    icon: Calendar,
    title: 'Rent Monthly',
    description: 'Break annual rent into 12 manageable monthly payments. Build your RentScore with every payment.',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const slide = slides[current]!;

  function handleNext() {
    if (current < slides.length - 1) {
      setCurrent(current + 1);
    } else {
      router.replace('/verify-nin');
    }
  }

  function handleSkip() {
    router.replace('/verify-nin');
  }

  const Icon = slide.icon;

  return (
    <main className="flex min-h-screen flex-col bg-surface">
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-primary/10">
          <Icon className="h-12 w-12 text-primary" />
        </div>
        <h2 className="mt-8 font-display text-2xl italic font-bold text-charcoal text-center">
          {slide.title}
        </h2>
        <p className="mt-4 max-w-sm text-center font-body text-charcoal/60 leading-relaxed">
          {slide.description}
        </p>
      </div>

      <div className="p-8">
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === current ? 'bg-primary' : 'bg-primary/20'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={handleSkip} className="flex-1">
            Skip
          </Button>
          <Button onClick={handleNext} className="flex-1">
            {current < slides.length - 1 ? 'Next' : 'Get started'}
          </Button>
        </div>
      </div>
    </main>
  );
}
