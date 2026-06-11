'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function SplashPage() {
  const router = useRouter();
  const [showButton, setShowButton] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 900);

    const redirectTimer = setTimeout(() => {
      router.push('/onboarding/role');
    }, 3500);

    return () => {
      clearTimeout(timer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-sand px-6 relative overflow-hidden">
      {/* Shield Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="mb-8"
      >
        <Shield size={72} className="text-terra drop-shadow-lg" />
      </motion.div>

      {/* Logo */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="font-playfair italic font-black text-5xl mb-4"
      >
        <span className="text-terra">Awa</span>
        <span className="text-charcoal">house</span>
      </motion.h1>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.8 }}
        className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted mb-12 text-center"
      >
        Verified · Protected · Secure
      </motion.p>

      {/* Get Started Button */}
      <AnimatePresence>
        {showButton && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-xs"
          >
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => router.push('/onboarding/role')}
            >
              Get Started →
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-transparent">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2.2, ease: 'linear' }}
          className="h-full bg-terra"
        />
      </div>
    </div>
  );
}
