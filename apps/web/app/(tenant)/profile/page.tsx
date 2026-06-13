'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  ShieldCheck, 
  ChevronRight, 
  LogOut, 
  CreditCard, 
  Settings, 
  Bell, 
  Building,
  UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { TopNav } from '@/components/layout/TopNav';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/Button';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { useAuthStore, type Role } from '@/hooks/useAuthStore';
import { trpc } from '@/lib/trpc/react';

export default function ProfilePage() {
  const router = useRouter();
  const [error, setError] = React.useState('');
  const { userId, roles, activeRole, setAuth, setActiveRole, clearAuth } = useAuthStore();

  const { data: verifData, isLoading: verifLoading } = trpc.verification.checkStatus.useQuery();
  const switchRoleMutation = trpc.auth.switchRole.useMutation();
  const signOutMutation = trpc.auth.signOut.useMutation();

  const handleSignOut = async () => {
    await signOutMutation.mutateAsync();
    clearAuth();
    router.push('/onboarding/role');
  };

  const handleSwitchRole = async (role: Role) => {
    if (role === activeRole) return;
    try {
      await switchRoleMutation.mutateAsync({ role: role as any });
      setActiveRole(role);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.message ?? 'Failed to switch role');
    }
  };

  const verifications = verifData?.verifications ?? [];
  const isNinVerified = verifications.some(v => v.type === 'nin' && v.status === 'approved');

  const menuItems = [
    { icon: CreditCard, label: 'Payment Methods', href: '/profile/payments' },
    { icon: Bell, label: 'Notifications', href: '/profile/notifications' },
    { icon: ShieldCheck, label: 'Security & Privacy', href: '/profile/security' },
    { icon: Settings, label: 'App Settings', href: '/profile/settings' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-sand pb-[80px]">
      <TopNav variant="brand" title="Profile" />

      <div className="flex-1 overflow-y-auto px-4 py-8">
        {/* User Header */}
        <section className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 rounded-full bg-white border-2 border-terra-light/20 flex items-center justify-center text-terra mb-4 relative shadow-sm">
            <User size={48} strokeWidth={1.5} />
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-success border-4 border-white rounded-full flex items-center justify-center text-white shadow-sm">
              <ShieldCheck size={14} />
            </div>
          </div>
          <h2 className="font-playfair text-2xl font-bold text-charcoal">Verified User</h2>
          <p className="text-[11px] font-mono text-muted uppercase tracking-widest mt-1">ID: {userId?.slice(0, 8)}</p>
          
          <div className="flex gap-2 mt-4">
             {isNinVerified && <VerifiedBadge type="nin_verified" size="sm" />}
             {roles.includes('agent') && <VerifiedBadge type="agent_verified" body="LASRERA" size="sm" />}
          </div>
        </section>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Workspace Switcher */}
        <section className="mb-10">
          <h3 className="font-mono text-[11px] uppercase tracking-widest text-muted mb-4 px-1">ACTIVE WORKSPACE</h3>
          <div className="grid grid-cols-1 gap-2">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => handleSwitchRole(role)}
                className={cn(
                  "p-4 rounded-card border-2 flex items-center justify-between transition-all group",
                  activeRole === role 
                    ? "bg-terra border-terra text-white shadow-lg" 
                    : "bg-white border-outline-variant text-charcoal hover:border-terra/30"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                    activeRole === role ? "bg-white/20" : "bg-sand"
                  )}>
                    {role === 'tenant' && <User size={20} />}
                    {role === 'landlord' && <Building size={20} />}
                    {role === 'agent' && <UserCheck size={20} />}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm capitalize">{role} Mode</p>
                    <p className={cn(
                      "text-[10px] uppercase font-mono tracking-wider",
                      activeRole === role ? "text-white/70" : "text-muted"
                    )}>
                      {activeRole === role ? 'Currently Active' : 'Switch to this role'}
                    </p>
                  </div>
                </div>
                {activeRole === role ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <ChevronRight size={20} className="text-muted group-hover:text-terra transition-colors" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Menu Items */}
        <section className="bg-white border border-outline-variant rounded-card overflow-hidden shadow-sm mb-10">
          {menuItems.map((item, i) => (
            <button
              key={i}
              onClick={() => router.push(item.href)}
              className={cn(
                "w-full p-4 flex items-center justify-between hover:bg-sand/30 transition-colors border-b border-outline-variant/30 last:border-0",
              )}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-sand flex items-center justify-center text-muted">
                  <item.icon size={20} />
                </div>
                <span className="font-bold text-charcoal text-sm">{item.label}</span>
              </div>
              <ChevronRight size={18} className="text-muted/50" />
            </button>
          ))}
        </section>

        {/* Logout */}
        <Button
          variant="ghost"
          size="lg"
          fullWidth
          onClick={handleSignOut}
          className="text-red-500 bg-red-50 border border-red-100 hover:bg-red-100"
          icon={<LogOut size={20} />}
        >
          Sign Out
        </Button>
      </div>

      <BottomNav role={activeRole?.toUpperCase() as any || 'TENANT'} />
    </div>
  );
}

function CheckCircle2({ size, className }: { size?: number, className?: string }) {
  return (
    <div className={cn("w-6 h-6 rounded-full bg-white flex items-center justify-center text-terra shadow-sm", className)}>
      <ShieldCheck size={size ? size - 4 : 16} />
    </div>
  );
}
