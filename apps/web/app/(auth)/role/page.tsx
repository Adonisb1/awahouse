'use client';

import { useRouter } from 'next/navigation';
import { Home, Building2, UserCheck } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';

const roles = [
  {
    id: 'tenant',
    title: 'Looking for a home',
    description: 'Browse verified properties, pay with escrow protection',
    icon: Home,
  },
  {
    id: 'landlord',
    title: 'I own property',
    description: 'List your properties and receive verified payouts',
    icon: Building2,
  },
  {
    id: 'agent',
    title: 'I\'m an agent',
    description: 'Manage listings for clients and earn commissions',
    icon: UserCheck,
  },
] as const;

export default function RolePage() {
  const router = useRouter();

  function handleSelect(role: string) {
    router.push(`/login?role=${role}`);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface p-6">
      <div className="mb-10 text-center">
        <h1 className="font-display text-4xl italic font-black text-charcoal">
          Welcome to Awa
        </h1>
        <p className="mt-2 font-body text-charcoal/60">How would you like to use Awa?</p>
      </div>

      <div className="flex w-full max-w-md flex-col gap-4">
        {roles.map((role) => {
          const Icon = role.icon;
          return (
            <button key={role.id} onClick={() => handleSelect(role.id)} className="text-left">
              <Card className="cursor-pointer transition-all hover:border-primary hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-warm">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-display text-xl font-bold text-charcoal">{role.title}</h2>
                      <p className="font-body text-sm text-charcoal/60">{role.description}</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </button>
          );
        })}
      </div>
    </main>
  );
}
