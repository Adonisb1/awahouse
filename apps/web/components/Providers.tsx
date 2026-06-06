'use client';

import { TRPCProvider } from '@/lib/trpc/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return <TRPCProvider>{children}</TRPCProvider>;
}
