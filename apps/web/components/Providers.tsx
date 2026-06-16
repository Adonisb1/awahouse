'use client';

import { TRPCProvider } from '@/lib/trpc/react';
import { SessionSync } from './SessionSync';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TRPCProvider>
      <SessionSync>{children}</SessionSync>
    </TRPCProvider>
  );
}
