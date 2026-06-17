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
  TrendingUp,
  Mail,
  Phone,
  LayoutDashboard,
  Star,
  Award,
  Plus,
  Edit2,
  Trash2,
  ArrowRight,
  Check,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { TopNav } from '@/components/layout/TopNav';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { useAuthStore, type Role } from '@/hooks/useAuthStore';
import { trpc } from '@/lib/trpc/react';
import { ProfileSidebarLayout } from '@/components/layout/ProfileSidebarLayout';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { KoboDisplay } from '@/components/ui/KoboDisplay';
import { EscrowStatusChip, EscrowStatus } from '@/components/escrow/EscrowStatusChip';
import Link from 'next/link';

export default function AgentProfilePage() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [activeTab, setActiveTab] = React.useState('overview');
  const [error, setError] = React.useState('');
  const { userId, roles, activeRole, setActiveRole, clearAuth } = useAuthStore();

  const { data: profile } = trpc.auth.getProfile.useQuery();
  const { data: verifData } = trpc.verification.checkStatus.useQuery();
  const { data: stats } = trpc.agent.getDashboardStats.useQuery();
  const { data: listingsData, isLoading: listingsLoading } = trpc.properties.listMyProperties.useQuery();
  const { data: escrowsData, isLoading: escrowsLoading } = trpc.escrow.list.useQuery({ limit: 50 });
  const { data: notificationsData } = trpc.notifications.list.useQuery({ limit: 20 });
  
  const switchRoleMutation = trpc.auth.switchRole.useMutation();
  const signOutMutation = trpc.auth.signOut.useMutation();
  const deletePropertyMutation = trpc.properties.delete.useMutation({
    onSuccess: () => utils.properties.listMyProperties.invalidate()
  });
  const updateProfileMutation = trpc.auth.updateProfile.useMutation();

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

  const handleDeleteProperty = (id: string) => {
    if (confirm('Are you sure you want to delete this listing?')) {
      deletePropertyMutation.mutate({ id });
    }
  };

  const verifications = verifData?.verifications ?? [];
  const isNinVerified = verifications.some(v => v.type === 'nin' && v.status === 'approved');
  const profBodyApproved = verifications.some(
    v => ['lasrera', 'esvarbon', 'niesv', 'aean', 'ercaan', 'redan'].includes(v.type) && v.status === 'approved'
  );
  const activeProfBody = verifications.find(
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
         {profBodyApproved && <VerifiedBadge type="agent_verified" body={activeProfBody?.type.toUpperCase()} size="sm" />}
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
              ? "bg-terra border-terra text-white shadow-lg" 
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
            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-terra shadow-sm">
              <Check size={12} strokeWidth={3} />
            </div>
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
        <TopNav variant="back" title="Profile" onBack={() => router.push('/agent')} />
      </div>
      
      <ProfileSidebarLayout
        userHeader={userHeader}
        workspaceSwitcher={workspaceSwitcher}
        menuItems={menuItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSignOut={handleSignOut}
        onBack={() => router.push('/agent')}
      >
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <header>
              <h1 className="font-playfair text-4xl font-bold text-charcoal mb-2">Agent Overview</h1>
              <p className="text-muted leading-relaxed">Track your performance, manage listings and professional credentials.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Details */}
              <section className="bg-white rounded-card p-8 border border-outline-variant/30 shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-outline-variant/30">
                  <div className="w-10 h-10 rounded-xl bg-sand flex items-center justify-center text-terra">
                    <User size={20} />
                  </div>
                  <h3 className="font-playfair text-xl font-bold">Professional Details</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[10px] uppercase text-muted tracking-widest">Legal Name</span>
                    <span className="font-bold text-charcoal">{profile?.firstName} {profile?.lastName}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[10px] uppercase text-muted tracking-widest">Real Estate Firm</span>
                    <span className="font-bold text-charcoal">{profile?.landlordProfile?.firmName ?? 'Independent Agent'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[10px] uppercase text-muted tracking-widest">Primary Contact</span>
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

            {/* Verification Status */}
            <section className="bg-white rounded-card p-8 border border-outline-variant/30 shadow-sm">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-outline-variant/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sand flex items-center justify-center text-terra">
                    <ShieldCheck size={20} />
                  </div>
                  <h3 className="font-playfair text-xl font-bold">Verification Status</h3>
                </div>
                {isNinVerified && profBodyApproved ? (
                  <VerifiedBadge type="fully_verified" size="md" />
                ) : (
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">Action Required</span>
                )}
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
                    <p className={cn("font-bold text-sm", isNinVerified ? "text-success" : "text-charcoal")}>Identity (NIN)</p>
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
                    <p className="text-[11px] text-muted mt-0.5">{profBodyApproved ? `${activeProfBody?.type.toUpperCase()} Verified` : 'Documents required'}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'listings' && (
          <div className="space-y-8">
            <header className="flex justify-between items-end">
              <div>
                <h1 className="font-playfair text-4xl font-bold text-charcoal mb-2">Manage Listings</h1>
                <p className="text-muted leading-relaxed">You have {listingsData?.properties?.length ?? 0} active listings on the platform.</p>
              </div>
              <Button onClick={() => router.push('/agent/listings/create')} icon={<Plus size={18} />}>New Listing</Button>
            </header>

            {listingsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-card animate-pulse shadow-sm" />)}
              </div>
            ) : listingsData?.properties?.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-outline-variant/30 rounded-card p-20 text-center">
                 <Building size={48} className="mx-auto text-muted/30 mb-4" />
                 <h3 className="font-bold text-charcoal text-lg mb-2">No listings found</h3>
                 <p className="text-muted mb-6">Create a listing to reach thousands of verified tenants.</p>
                 <Button onClick={() => router.push('/agent/listings/create')}>Create Listing</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {listingsData?.properties?.map((prop) => (
                  <div key={prop.id} className="bg-white border border-outline-variant rounded-card p-4 flex gap-4 shadow-sm group hover:border-terra transition-all">
                    <div className="w-24 h-24 rounded-xl bg-sand-warm overflow-hidden shrink-0 relative">
                       {prop.images?.[0] ? (
                         <img src={prop.images[0].url} alt="" className="w-full h-full object-cover" />
                       ) : (
                         <div className="w-full h-full bg-gradient-to-br from-terra/10 to-terra/5 flex items-center justify-center text-terra/20 font-playfair italic text-3xl">A</div>
                       )}
                       <div className="absolute top-1.5 left-1.5">
                         <VerifiedBadge type={prop.verificationBadge as any} size="sm" />
                       </div>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-charcoal text-lg truncate mb-0.5">{prop.title}</h4>
                          <p className="text-xs text-muted font-mono uppercase tracking-wider mb-2">{prop.lga} • {prop.type}</p>
                        </div>
                        <div className="font-playfair font-bold text-terra-dark text-lg">
                          <KoboDisplay kobo={Number(prop.priceKobo)} size="sm" />
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-auto">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/agent/listings/${prop.id}/edit`)} icon={<Edit2 size={14} />}>Edit</Button>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteProperty(prop.id)} icon={<Trash2 size={14} />}>Delete</Button>
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/property/${prop.id}`)} className="ml-auto">Preview <ExternalLink size={14} className="ml-1" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="space-y-8">
            <header>
              <h1 className="font-playfair text-4xl font-bold text-charcoal mb-2">My Clients</h1>
              <p className="text-muted leading-relaxed">Manage your relationships with tenants and track their escrows.</p>
            </header>

            {escrowsLoading ? (
               <div className="space-y-4">
                 {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-card animate-pulse shadow-sm" />)}
               </div>
            ) : escrowsData?.items?.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-outline-variant/30 rounded-card p-20 text-center">
                <Users size={48} className="mx-auto text-muted/30 mb-4" />
                <h3 className="font-bold text-charcoal text-lg mb-2">No clients yet</h3>
                <p className="text-muted">Clients will appear here when they initiate interest or payment for your listings.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {escrowsData?.items?.map((escrow) => (
                  <div key={escrow.id} className="bg-white border border-outline-variant rounded-card p-5 shadow-sm hover:border-terra transition-colors cursor-pointer" onClick={() => router.push(`/agent/clients/${escrow.tenantId}`)}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-sand flex items-center justify-center text-muted">
                        <User size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-charcoal truncate">{escrow.tenant.firstName} {escrow.tenant.lastName}</h4>
                        <p className="text-[10px] font-mono text-muted uppercase">Active Escrow • {escrow.property.title}</p>
                      </div>
                      <EscrowStatusChip status={escrow.status as EscrowStatus} />
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-outline-variant/30">
                       <Button variant="ghost" size="sm" className="px-0 h-auto font-bold text-terra">View Client Profile</Button>
                       <span className="text-[10px] font-mono text-muted">Updated {new Date(escrow.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'verification' && (
          <div className="space-y-8 max-w-2xl">
            <header>
              <h1 className="font-playfair text-4xl font-bold text-charcoal mb-2">Verification</h1>
              <p className="text-muted leading-relaxed">Update your credentials to maintain your "Verified Agent" status.</p>
            </header>

            <section className="space-y-6">
               <div className="bg-white rounded-card p-8 border border-outline-variant/30 shadow-sm space-y-6">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-success-bg flex items-center justify-center text-success shadow-sm">
                       <ShieldCheck size={24} />
                     </div>
                     <div>
                       <h3 className="font-bold text-charcoal">Identity Verification (NIN)</h3>
                       <p className="text-xs text-muted">Verified on Oct 12, 2024</p>
                     </div>
                   </div>
                   <VerifiedBadge type="nin_verified" size="sm" />
                 </div>
               </div>

               <div className="bg-white rounded-card p-8 border border-outline-variant/30 shadow-sm space-y-6">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                     <div className={cn(
                       "w-12 h-12 rounded-full flex items-center justify-center shadow-sm",
                       profBodyApproved ? "bg-success-bg text-success" : "bg-amber-50 text-amber-600"
                     )}>
                       <Briefcase size={24} />
                     </div>
                     <div>
                       <h3 className="font-bold text-charcoal">Professional Body</h3>
                       <p className="text-xs text-muted">
                         {profBodyApproved ? `${activeProfBody?.type.toUpperCase()} Membership confirmed` : 'Action required: Upload your membership certificate'}
                       </p>
                     </div>
                   </div>
                   {profBodyApproved ? <VerifiedBadge type="agent_verified" body={activeProfBody?.type.toUpperCase()} size="sm" /> : <Button size="sm" onClick={() => router.push('/verify-agent')}>Verify Now</Button>}
                 </div>
               </div>
            </section>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-8">
            <header className="flex justify-between items-end">
              <div>
                <h1 className="font-playfair text-4xl font-bold text-charcoal mb-2">Notifications</h1>
                <p className="text-muted leading-relaxed">Stay updated on client activity and escrow updates.</p>
              </div>
              <Button variant="ghost" size="sm">Mark all as read</Button>
            </header>

            <div className="bg-white border border-outline-variant rounded-card overflow-hidden shadow-sm">
              {notificationsData?.items && notificationsData.items.length > 0 ? (
                notificationsData.items.map((n) => (
                  <div key={n.id} className={cn(
                    "p-5 flex gap-4 border-b border-outline-variant/30 last:border-0 hover:bg-sand/30 transition-colors",
                    !n.isRead && "bg-terra/5 border-l-4 border-l-terra"
                  )}>
                    <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center text-muted shrink-0">
                      <Bell size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-charcoal text-sm">{n.title}</h4>
                        <span className="text-[10px] font-mono text-muted uppercase">{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-muted leading-relaxed">{n.body}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-20 text-center text-muted text-sm">No notifications found.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8 max-w-2xl">
            <header>
              <h1 className="font-playfair text-4xl font-bold text-charcoal mb-2">Account Settings</h1>
              <p className="text-muted leading-relaxed">Manage your personal profile and account security.</p>
            </header>

            <section className="bg-white rounded-card p-8 border border-outline-variant/30 shadow-sm space-y-8">
              <div className="flex items-center gap-6 pb-6 border-b border-outline-variant/30">
                <div className="w-20 h-20 rounded-full bg-sand flex items-center justify-center text-terra relative group cursor-pointer overflow-hidden shadow-inner">
                   {profile?.avatarUrl ? (
                     <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                   ) : (
                     <User size={32} />
                   )}
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                     <Edit2 size={16} />
                   </div>
                </div>
                <div>
                   <h3 className="font-bold text-charcoal">Agent Avatar</h3>
                   <p className="text-xs text-muted mt-1">High quality photos build more trust.</p>
                   <div className="flex gap-3 mt-3">
                     <button className="text-xs font-bold text-terra hover:underline">Upload new</button>
                     <button className="text-xs font-bold text-red-500 hover:underline">Remove</button>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="First Name" value={profile?.firstName ?? ''} onChangeValue={() => {}} />
                <Input label="Last Name" value={profile?.lastName ?? ''} onChangeValue={() => {}} />
              </div>
              <Input label="Real Estate Agency" value={profile?.landlordProfile?.firmName ?? ''} onChangeValue={() => {}} />
              <Input label="Email Address" value={profile?.email ?? ''} onChangeValue={() => {}} disabled />
              <Input
                label="Mobile Number"
                value={profile?.phone ?? ''}
                onChangeValue={(val) => {
                  updateProfileMutation.mutate({ phone: val || undefined });
                }}
              />

              <Button fullWidth size="lg">Save Changes</Button>
            </section>
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
