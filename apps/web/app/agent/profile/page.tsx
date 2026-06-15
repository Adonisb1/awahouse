'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  ShieldCheck, 
  ChevronRight, 
  LogOut, 
  Settings, 
  Bell, 
  Building,
  UserCheck,
  Users,
  Briefcase,
  History,
  TrendingUp,
  Mail,
  Phone,
  LayoutDashboard,
  Star,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { TopNav } from '@/components/layout/TopNav';
import { BottomNav, type UserRole } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/Button';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { useAuthStore, type Role } from '@/hooks/useAuthStore';
import { trpc } from '@/lib/trpc/react';
import { ProfileSidebarLayout } from '@/components/layout/ProfileSidebarLayout';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { KoboDisplay } from '@/components/ui/KoboDisplay';
import Link from 'next/link';

export default function AgentProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState('overview');
  const [error, setError] = React.useState('');
  const { userId, roles, activeRole, setActiveRole, clearAuth } = useAuthStore();

  const { data: profile } = trpc.auth.getProfile.useQuery();
  const { data: verifData } = trpc.verification.checkStatus.useQuery();
  const { data: stats } = trpc.agent.getDashboardStats.useQuery();
  
  const switchRoleMutation = trpc.auth.switchRole.useMutation();
  const signOutMutation = trpc.auth.signOut.useMutation();

  const handleSignOut = async () => {
    try {
      await signOutMutation.mutateAsync();
      clearAuth();
      router.push('/role');
    } catch (err) {
      clearAuth();
      router.push('/role');
    }
  };

  const handleSwitchRole = async (role: Role) => {
    if (role === activeRole) return;
    try {
      await switchRoleMutation.mutateAsync({ role });
      setActiveRole(role);
      router.push(role === 'tenant' ? '/explore' : role === 'agent' ? '/agent' : '/landlord');
    } catch (err: any) {
      setError(err?.message ?? 'Failed to switch role');
    }
  };

  const verifications = verifData?.verifications ?? [];
  const isNinVerified = verifications.some(v => v.type === 'nin' && v.status === 'approved');
  const profBodyApproved = verifications.some(
    v => ['lasrera', 'esvarbon', 'niesv', 'aean', 'ercaan', 'redan'].includes(v.type) && v.status === 'approved'
  );

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'listings', label: 'My Listings', icon: Building },
    { id: 'clients', label: 'My Clients', icon: Users },
    { id: 'verification', label: 'Verification', icon: ShieldCheck },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Account Settings', icon: Settings },
  ];

  const userHeader = (
    <div className="flex flex-col items-center text-center">
      <div className="w-24 h-24 rounded-full bg-white border-2 border-terra-light/20 flex items-center justify-center text-terra mb-4 relative shadow-sm overflow-hidden">
        {profile?.avatarUrl ? (
          <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <User size={48} strokeWidth={1.5} />
        )}
        <div className="absolute bottom-0 right-0 w-8 h-8 bg-success border-4 border-white rounded-full flex items-center justify-center text-white shadow-sm">
          <ShieldCheck size={14} />
        </div>
      </div>
      <h2 className="font-playfair text-2xl font-bold text-charcoal">
        {profile?.firstName ? `${profile.firstName} ${profile.lastName ?? ''}` : 'Verified Agent'}
      </h2>
      <p className="text-[11px] font-mono text-muted uppercase tracking-widest mt-1">
        {profile?.landlordProfile?.firmName ?? `ID: ${userId?.slice(0, 8)}`}
      </p>
      
      <div className="flex gap-2 mt-4">
         {isNinVerified && <VerifiedBadge type="nin_verified" size="sm" />}
         {profBodyApproved && <VerifiedBadge type="agent_verified" body="VERIFIED" size="sm" />}
      </div>
    </div>
  );

  const workspaceSwitcher = (
    <div className="space-y-2">
      <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted mb-4 px-1">Active Workspace</h3>
      {roles.map((role) => (
        <button
          key={role}
          onClick={() => handleSwitchRole(role)}
          className={cn(
            "w-full p-3 rounded-xl border-2 flex items-center justify-between transition-all group",
            activeRole === role 
              ? "bg-terra border-terra text-white shadow-md" 
              : "bg-white border-outline-variant text-charcoal hover:border-terra/30"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
              activeRole === role ? "bg-white/20" : "bg-sand"
            )}>
              {role === 'tenant' && <User size={16} />}
              {role === 'landlord' && <Building size={16} />}
              {role === 'agent' && <UserCheck size={16} />}
            </div>
            <div className="text-left">
              <p className="font-bold text-xs capitalize">{role} Mode</p>
            </div>
          </div>
          {activeRole === role ? (
            <ShieldCheck size={16} className="text-white" />
          ) : (
            <ChevronRight size={16} className="text-muted/50 group-hover:text-terra" />
          )}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <div className="md:hidden">
        <TopNav variant="brand" title="Profile" />
      </div>
      
      <ProfileSidebarLayout
        userHeader={userHeader}
        workspaceSwitcher={workspaceSwitcher}
        menuItems={menuItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSignOut={handleSignOut}
      >
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <header>
              <h1 className="font-playfair text-4xl font-bold text-charcoal mb-2">Agent Overview</h1>
              <p className="text-muted leading-relaxed">Track your performance, manages listings and clients.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Details */}
              <section className="bg-white rounded-card p-8 border border-outline-variant/30 shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-outline-variant/30">
                  <div className="w-10 h-10 rounded-xl bg-sand flex items-center justify-center text-terra">
                    <User size={20} />
                  </div>
                  <h3 className="font-playfair text-xl font-bold">Agent Profile</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[10px] uppercase text-muted tracking-widest">Legal Name</span>
                    <span className="font-bold text-charcoal">{profile?.firstName} {profile?.lastName}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[10px] uppercase text-muted tracking-widest">Associated Firm</span>
                    <span className="font-bold text-charcoal">{profile?.landlordProfile?.firmName ?? 'Independent Agent'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[10px] uppercase text-muted tracking-widest">Contact Email</span>
                    <span className="font-bold text-charcoal flex items-center gap-2">
                      <Mail size={14} className="text-muted" />
                      {profile?.email}
                    </span>
                  </div>
                </div>
              </section>

              {/* Stats Card */}
              <section className="bg-white rounded-card p-8 border border-outline-variant/30 shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-outline-variant/30">
                  <div className="w-10 h-10 rounded-xl bg-sand flex items-center justify-center text-terra">
                    <TrendingUp size={20} />
                  </div>
                  <h3 className="font-playfair text-xl font-bold">Performance Stats</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-4 p-4 bg-sand/30 rounded-xl border border-outline-variant/20">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-terra shadow-sm">
                      <Building size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-mono text-[9px] uppercase text-muted tracking-wider">Listings</span>
                      <span className="font-bold text-charcoal">{stats?.listingsCount ?? 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-sand/30 rounded-xl border border-outline-variant/20">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-terra shadow-sm">
                      <Star size={18} className="text-amber-500 fill-amber-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-mono text-[9px] uppercase text-muted tracking-wider">Rating</span>
                      <span className="font-bold text-charcoal">{stats?.avgRating?.toFixed(1) ?? '—'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-terra/5 rounded-xl border border-terra/10 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-mono text-[9px] uppercase text-terra-dark tracking-wider">Total Commission</span>
                    <span className="font-bold text-terra-dark">
                      <KoboDisplay kobo={Number(stats?.totalCommissionKobo ?? 0n)} size="sm" />
                    </span>
                  </div>
                  <Award size={20} className="text-terra opacity-40" />
                </div>
              </section>
            </div>

            {/* Verification Section */}
            <section className="bg-white rounded-card p-8 border border-outline-variant/30 shadow-sm">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-outline-variant/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sand flex items-center justify-center text-terra">
                    <ShieldCheck size={20} />
                  </div>
                  <h3 className="font-playfair text-xl font-bold">Verification Badges</h3>
                </div>
                <button onClick={() => setActiveTab('verification')} className="text-xs font-bold text-terra hover:underline">Update docs</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={cn(
                  "p-5 rounded-xl border flex items-center gap-4 transition-all",
                  isNinVerified ? "bg-success-bg border-success/10" : "bg-gray-50 border-outline-variant/10"
                )}>
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center shadow-sm",
                    isNinVerified ? "bg-white text-success" : "bg-white text-muted"
                  )}>
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <p className={cn("font-bold text-sm", isNinVerified ? "text-success" : "text-charcoal")}>NIN Verified</p>
                    <p className="text-[11px] text-muted mt-0.5">{isNinVerified ? 'Identity confirmed via NIMC' : 'Action required'}</p>
                  </div>
                </div>

                <div className={cn(
                  "p-5 rounded-xl border flex items-center gap-4 transition-all",
                  profBodyApproved ? "bg-success-bg border-success/10" : "bg-gray-50 border-outline-variant/10"
                )}>
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center shadow-sm",
                    profBodyApproved ? "bg-white text-success" : "bg-white text-muted"
                  )}>
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <p className={cn("font-bold text-sm", profBodyApproved ? "text-success" : "text-charcoal")}>Professional Body</p>
                    <p className="text-[11px] text-muted mt-0.5">{profBodyApproved ? 'LASRERA/ESVARBON Verified' : 'Documents required'}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab !== 'overview' && (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="w-20 h-20 rounded-full bg-sand flex items-center justify-center text-terra/30 mb-6">
              <History size={40} />
            </div>
            <h2 className="font-playfair text-2xl font-bold text-charcoal mb-2">{menuItems.find(i => i.id === activeTab)?.label}</h2>
            <p className="text-muted max-w-sm">This section is being expanded into the new sidebar layout. Please check back shortly for detailed controls.</p>
          </div>
        )}
      </ProfileSidebarLayout>

      <div className="md:hidden">
        <BottomNav role="AGENT" />
      </div>
    </>
  );
}

function CheckCircle2({ size, className }: { size?: number, className?: string }) {
  return (
    <div className={cn("w-6 h-6 rounded-full bg-white flex items-center justify-center text-terra shadow-sm", className)}>
      <ShieldCheck size={size ? size - 4 : 16} />
    </div>
  );
}
