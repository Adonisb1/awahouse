'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashPage() {
  const router = useRouter();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => {
      router.replace('/role');
    }, 2200);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-primary">
      <div
        className={`transition-all duration-1000 ease-out ${
          animate ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
      >
        <h1 className="font-display text-7xl italic font-black text-white tracking-tight">
          Awa
        </h1>
      </div>
      <p
        className={`mt-4 font-body text-primary-light transition-all duration-1000 delay-300 ease-out ${
          animate ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        Trusted homes. Verified.
      </p>
    </main>
  );
}
