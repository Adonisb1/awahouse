'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/useAuthStore';
import { trpc } from '@/lib/trpc/react';

const roleLabels: Record<string, string> = {
  tenant: 'Tenant',
  landlord: 'Landlord',
  agent: 'Agent',
  admin: 'Admin',
};

const rolePaths: Record<string, string> = {
  tenant: '/explore',
  landlord: '/landlord',
  agent: '/agent',
  admin: '/admin/dashboard',
};

export function RoleSwitcher() {
  const router = useRouter();
  const roles = useAuthStore((s) => s.roles);
  const activeRole = useAuthStore((s) => s.activeRole);
  const setActiveRole = useAuthStore((s) => s.setActiveRole);
  const [open, setOpen] = useState(false);

  const switchRoleMutation = trpc.auth.switchRole.useMutation();

  if (roles.length <= 1) return null;

  async function handleSwitch(role: string) {
    if (role === activeRole) {
      setOpen(false);
      return;
    }
    try {
      await switchRoleMutation.mutateAsync({ role: role as 'tenant' | 'landlord' | 'agent' | 'admin' });
      setActiveRole(role as 'tenant' | 'landlord' | 'agent' | 'admin');
      setOpen(false);
      router.push(rolePaths[role] ?? '/');
    } catch {
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg bg-surface-sand px-3 py-2 font-body text-sm font-medium text-charcoal transition-colors hover:bg-surface-warm"
        aria-label="Switch role"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
          {activeRole ? activeRole.charAt(0).toUpperCase() : '?'}
        </span>
        {activeRole ? roleLabels[activeRole] : 'Select role'}
        <svg className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => handleSwitch(role)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 font-body text-sm transition-colors ${
                  role === activeRole
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-charcoal hover:bg-surface-sand'
                }`}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {role.charAt(0).toUpperCase()}
                </span>
                {roleLabels[role]}
                {role === activeRole && (
                  <svg className="ml-auto h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
