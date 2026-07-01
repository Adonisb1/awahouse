'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  ShieldCheck, 
  ChevronRight, 
  CreditCard, 
  Settings, 
  Bell, 
  Building,
  UserCheck,
  Smartphone,
  ShieldAlert,
  History,
  TrendingUp,
  Mail,
  Phone,
  LayoutDashboard,
  Plus,
  Trash2,
  Lock,
  Eye,
  LogOut,
  Check,
  Edit2
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { TopNav } from '@/components/layout/TopNav';
import { BottomNav, type UserRole } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { useAuthStore, type Role } from '@/hooks/useAuthStore';
import { AvatarUpload } from '@/components/ui/AvatarUpload';
import { trpc } from '@/lib/trpc/react';
import { ProfileSidebarLayout } from '@/components/layout/ProfileSidebarLayout';
import { KoboDisplay } from '@/components/ui/KoboDisplay';
import { NotificationBell } from '@/components/layout/NotificationBell';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState('overview');
  const [error, setError] = React.useState('');
  const { userId, roles, activeRole, setActiveRole, clearAuth } = useAuthStore();

  const [twoFactorEnabled, setTwoFactorEnabled] = React.useState(true);
  const [shareScore, setShareScore] = React.useState(true);
  const [showBadge, setShowBadge] = React.useState(true);
  const [allowMarketing, setAllowMarketing] = React.useState(false);

  const [toastMessage, setToastMessage] = React.useState('');
  const [toastType, setToastType] = React.useState<'success' | 'error'>('success');

  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = React.useState(false);
  const [modalError, setModalError] = React.useState('');

  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [phone, setPhone] = React.useState('');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const { data: profile } = trpc.auth.getProfile.useQuery();
  const { data: verifData } = trpc.verification.checkStatus.useQuery();
  const { data: scoreData } = trpc.rentScore.get.useQuery({});
  const { data: notificationsData } = trpc.notifications.list.useQuery({ limit: 20 });

  React.useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName ?? '');
      setLastName(profile.lastName ?? '');
      setPhone(profile.phone ?? '');
    }
  }, [profile]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setModalError('All password fields are required');
      return;
    }
    if (newPassword.length < 8) {
      setModalError('Password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setModalError('New passwords do not match');
      return;
    }

    setIsUpdatingPassword(true);
    setModalError('');

    try {
      const { createAnonSupabaseClient } = await import('@/lib/auth/supabase');
      const supabase = createAnonSupabaseClient();
      if (!supabase) {
        throw new Error('Authentication client unavailable');
      }

      const sessionToken = useAuthStore.getState().sessionToken;
      if (!sessionToken) {
        throw new Error('You must be logged in to change your password');
      }

      // First set the session so the client is authenticated
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: sessionToken,
        refresh_token: '', // We only need the access token for this request
      });
      if (sessionError) throw new Error('Session expired. Please log in again.');

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      showToast('Password updated successfully');
      setShowPasswordModal(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setModalError(err?.message ?? 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };
  
  const switchRoleMutation = trpc.auth.switchRole.useMutation();
  const signOutMutation = trpc.auth.signOut.useMutation();
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

  const verifications = verifData?.verifications ?? [];
  const isNinVerified = verifications.some(v => v.type === 'nin' && v.status === 'approved');

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'payments', label: 'Payment Methods', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security & Privacy', icon: ShieldAlert },
    { id: 'settings', label: 'App Settings', icon: Settings },
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
        {profile?.firstName ? `${profile.firstName} ${profile.lastName ?? ''}` : 'Verified User'}
      </h2>
      <p className="text-[11px] font-mono text-muted uppercase tracking-widest mt-1">ID: {userId?.slice(0, 8)}</p>
      
      <div className="flex gap-2 mt-4">
         {isNinVerified && <VerifiedBadge type="nin_verified" size="sm" />}
         {roles.includes('agent') && <VerifiedBadge type="agent_verified" body="AGENT" size="sm" />}
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
        <TopNav variant="back" title="Profile" onBack={() => router.push('/explore')} />
      </div>
      
      <ProfileSidebarLayout
        userHeader={userHeader}
        workspaceSwitcher={workspaceSwitcher}
        menuItems={menuItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSignOut={handleSignOut}
        onBack={() => router.push('/explore')}
      >
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <header>
              <h1 className="font-playfair text-4xl font-bold text-charcoal mb-2">Account Overview</h1>
              <p className="text-muted leading-relaxed">View your personal details, stats and verification status.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Details */}
              <section className="bg-white rounded-card p-8 border border-outline-variant/30 shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-outline-variant/30">
                  <div className="w-10 h-10 rounded-xl bg-sand flex items-center justify-center text-terra">
                    <User size={20} />
                  </div>
                  <h3 className="font-playfair text-xl font-bold">Personal Details</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[10px] uppercase text-muted tracking-widest">Full Name</span>
                    <span className="font-bold text-charcoal">{profile?.firstName} {profile?.lastName}</span>
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="font-mono text-[10px] uppercase text-muted tracking-widest">Email Address</span>
                    <span className="font-bold text-charcoal flex items-start gap-2 break-all">
                      <Mail size={14} className="text-muted shrink-0 mt-1" />
                      {profile?.email}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[10px] uppercase text-muted tracking-widest">Phone Number</span>
                    <span className="font-bold text-charcoal flex items-center gap-2">
                      <Phone size={14} className="text-muted" />
                      {profile?.phone ?? 'Not provided'}
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
                  <h3 className="font-playfair text-xl font-bold">RentScore & Stats</h3>
                </div>

                <div className="flex items-center justify-between p-4 bg-sand/30 rounded-xl border border-outline-variant/20">
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] uppercase text-muted tracking-widest mb-1">Current RentScore</span>
                    <span className="font-playfair text-3xl font-bold text-terra-dark">{scoreData?.score ?? 500}</span>
                  </div>
                  <div className="w-12 h-12 rounded-full border-4 border-terra/20 border-t-terra flex items-center justify-center">
                    <TrendingUp size={18} className="text-terra" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1 p-3 bg-gray-50 rounded-lg">
                    <span className="font-mono text-[9px] uppercase text-muted tracking-wider">Active Escrows</span>
                    <span className="font-bold text-charcoal">0</span>
                  </div>
                  <div className="flex flex-col gap-1 p-3 bg-gray-50 rounded-lg">
                    <span className="font-mono text-[9px] uppercase text-muted tracking-wider">Saved Properties</span>
                    <span className="font-bold text-charcoal">0</span>
                  </div>
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
                {isNinVerified ? (
                  <VerifiedBadge type="nin_verified" size="md" />
                ) : (
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">Action Required</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => router.push('/verify-nin')}
                  className={cn(
                    "p-5 rounded-xl border flex flex-col gap-3 transition-all text-left group",
                    isNinVerified 
                      ? "bg-success-bg/50 border-success/20 hover:border-success/40" 
                      : "bg-white border-outline-variant/30 hover:border-terra/40 hover:shadow-md hover:-translate-y-0.5"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shadow-sm",
                      isNinVerified ? "bg-success text-white" : "bg-sand text-terra"
                    )}>
                      <ShieldCheck size={18} />
                    </div>
                    {isNinVerified ? (
                      <Check size={18} className="text-success" />
                    ) : (
                      <ChevronRight size={18} className="text-muted group-hover:text-terra transition-colors" />
                    )}
                  </div>
                  <div>
                    <p className={cn("font-bold text-base", isNinVerified ? "text-success" : "text-charcoal")}>Identity (NIN)</p>
                    <p className="text-xs text-muted mt-1 leading-relaxed">
                      {isNinVerified ? 'Your identity has been securely verified.' : 'Verify your NIN to unlock all features.'}
                    </p>
                  </div>
                </button>
                
                <button 
                  onClick={() => router.push('/verify-phone')}
                  className="p-5 rounded-xl bg-white border border-outline-variant/30 hover:border-terra/40 hover:shadow-md hover:-translate-y-0.5 transition-all text-left flex flex-col gap-3 group"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center text-terra shadow-sm">
                      <Smartphone size={18} />
                    </div>
                    {profile?.phoneVerified ? (
                      <Check size={18} className="text-success" />
                    ) : (
                      <ChevronRight size={18} className="text-muted group-hover:text-terra transition-colors" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-base text-charcoal">Phone Number</p>
                    <p className="text-xs text-muted mt-1 leading-relaxed">
                      {profile?.phoneVerified
                        ? `${profile.phone} — Verified`
                        : profile?.phone
                          ? `${profile.phone} — Tap to verify`
                          : 'Add and verify your phone number'}
                    </p>
                  </div>
                </button>


              </div>
            </section>
          </div>
        )}

        {activeTab === 'payments' && <PaymentsTab profile={profile} />}

        {activeTab === 'notifications' && (
          <div className="space-y-8">
            <header className="flex justify-between items-end">
              <div>
                <h1 className="font-playfair text-4xl font-bold text-charcoal mb-2">Notifications</h1>
                <p className="text-muted leading-relaxed">Stay updated on your rent applications and scores.</p>
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

        {activeTab === 'security' && (
          <div className="space-y-8 max-w-2xl">
            <header>
              <h1 className="font-playfair text-4xl font-bold text-charcoal mb-2">Security & Privacy</h1>
              <p className="text-muted leading-relaxed">Protect your account and control your data sharing.</p>
            </header>

            <section className="space-y-6">
               <div className="bg-white rounded-card p-8 border border-outline-variant/30 shadow-sm space-y-8">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-sand flex items-center justify-center text-terra">
                       <Lock size={24} />
                     </div>
                     <div>
                       <h3 className="font-bold text-charcoal text-lg">Change Password</h3>
                       <p className="text-xs text-muted">Last changed 3 months ago</p>
                     </div>
                   </div>
                   <Button variant="secondary" size="sm" onClick={() => setShowPasswordModal(true)}>Update</Button>
                 </div>
                 
                 <div className="pt-8 border-t border-outline-variant/30 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-sand flex items-center justify-center text-terra">
                       <Smartphone size={24} />
                     </div>
                     <div>
                       <h3 className="font-bold text-charcoal text-lg">Two-Factor Auth</h3>
                       <p className="text-xs text-muted">
                         {twoFactorEnabled ? 'Currently enabled via SMS' : 'Disabled'}
                       </p>
                     </div>
                   </div>
                   <button 
                     onClick={() => {
                       const newVal = !twoFactorEnabled;
                       setTwoFactorEnabled(newVal);
                       showToast(newVal ? 'Two-Factor Authentication enabled' : 'Two-Factor Authentication disabled');
                     }}
                     className={cn(
                       "w-12 h-6 rounded-full p-1 flex transition-colors shrink-0 outline-none",
                       twoFactorEnabled ? "bg-terra justify-end" : "bg-gray-200 justify-start"
                     )}
                   >
                      <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                   </button>
                 </div>

                 <div className="pt-8 border-t border-outline-variant/30">
                    <h3 className="font-bold text-charcoal mb-4">Sharing Preferences</h3>
                    <div className="space-y-6">
                      {/* Preference 1 */}
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-charcoal">Share RentScore with prospective landlords</p>
                          <p className="text-[11px] text-muted">Allows verified landlords to see your score when you apply.</p>
                        </div>
                        <button 
                          onClick={() => {
                            const newVal = !shareScore;
                            setShareScore(newVal);
                            showToast(newVal ? 'Sharing RentScore enabled' : 'Sharing RentScore disabled');
                          }}
                          className={cn(
                            "w-10 h-5 rounded-full p-0.5 flex transition-colors shrink-0 outline-none",
                            shareScore ? "bg-terra justify-end" : "bg-gray-200 justify-start"
                          )}
                        >
                           <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                        </button>
                      </div>

                      {/* Preference 2 */}
                      <div className="flex justify-between items-start gap-4 pt-4 border-t border-outline-variant/10">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-charcoal">Show identity badge on profile</p>
                          <p className="text-[11px] text-muted">Display "NIN Verified" to build trust with agents.</p>
                        </div>
                        <button 
                          onClick={() => {
                            const newVal = !showBadge;
                            setShowBadge(newVal);
                            showToast(newVal ? 'Identity badge visible on profile' : 'Identity badge hidden');
                          }}
                          className={cn(
                            "w-10 h-5 rounded-full p-0.5 flex transition-colors shrink-0 outline-none",
                            showBadge ? "bg-terra justify-end" : "bg-gray-200 justify-start"
                          )}
                        >
                           <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                        </button>
                      </div>

                      {/* Preference 3 */}
                      <div className="flex justify-between items-start gap-4 pt-4 border-t border-outline-variant/10">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-charcoal">Allow marketing communications</p>
                          <p className="text-[11px] text-muted">Receive property tips and platform updates.</p>
                        </div>
                        <button 
                          onClick={() => {
                            const newVal = !allowMarketing;
                            setAllowMarketing(newVal);
                            showToast(newVal ? 'Opted in to marketing communications' : 'Opted out of marketing communications');
                          }}
                          className={cn(
                            "w-10 h-5 rounded-full p-0.5 flex transition-colors shrink-0 outline-none",
                            allowMarketing ? "bg-terra justify-end" : "bg-gray-200 justify-start"
                          )}
                        >
                           <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                        </button>
                      </div>
                    </div>
                 </div>
               </div>
            </section>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8 max-w-2xl">
            <header>
              <h1 className="font-playfair text-4xl font-bold text-charcoal mb-2">App Settings</h1>
              <p className="text-muted leading-relaxed">Customize your personal profile and experience.</p>
            </header>

            <section className="bg-white rounded-card p-8 border border-outline-variant/30 shadow-sm space-y-8">
              <div className="pb-6 border-b border-outline-variant/30">
                <AvatarUpload
                  currentUrl={profile?.avatarUrl}
                  onUpload={(url) => updateProfileMutation.mutate({ avatarUrl: url })}
                  onRemove={() => updateProfileMutation.mutate({ avatarUrl: '' })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="First Name" value={firstName} onChangeValue={setFirstName} />
                <Input label="Last Name" value={lastName} onChangeValue={setLastName} />
              </div>
              <Input label="Email Address" value={profile?.email ?? ''} disabled />
              <Input
                label="Mobile Number"
                value={phone}
                onChangeValue={setPhone}
              />

              <div className="pt-4">
                 <Button 
                   fullWidth 
                   size="lg" 
                   loading={updateProfileMutation.isPending}
                   onClick={async () => {
                     try {
                       await updateProfileMutation.mutateAsync({
                         firstName: firstName || undefined,
                         lastName: lastName || undefined,
                         phone: phone || undefined,
                       });
                       showToast('Account details saved successfully');
                     } catch (err: any) {
                       showToast(err?.message ?? 'Failed to save account details', 'error');
                     }
                   }}
                 >
                   Save Account Details
                 </Button>
              </div>
            </section>
          </div>
        )}
      </ProfileSidebarLayout>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-charcoal-deep/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-card border border-outline-variant/30 shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
            <header className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-sand-warm/20">
              <h3 className="font-playfair text-xl font-bold text-charcoal">Change Password</h3>
              <button 
                onClick={() => setShowPasswordModal(false)}
                className="text-muted hover:text-charcoal transition-colors text-lg font-bold"
              >
                ✕
              </button>
            </header>
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              {modalError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl px-4 py-3">
                  {modalError}
                </div>
              )}
              
              <Input
                label="New Password"
                type="password"
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChangeValue={setNewPassword}
              />
              
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChangeValue={setConfirmPassword}
              />
              
              <div className="pt-4 flex gap-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  fullWidth 
                  onClick={() => setShowPasswordModal(false)}
                  disabled={isUpdatingPassword}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  fullWidth 
                  loading={isUpdatingPassword}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success/Error Toast */}
      {toastMessage && (
        <div className={cn(
          "fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-lg border text-sm font-body z-50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4",
          toastType === 'success' ? "bg-success-bg border-success/30 text-success" : "bg-red-50 border-red-200 text-red-700"
        )}>
          <Check size={16} />
          {toastMessage}
        </div>
      )}

      <div className="md:hidden">
        <BottomNav role={(activeRole?.toUpperCase() ?? 'TENANT') as UserRole} />
      </div>
    </>
  );
}

function PaymentsTab({ profile }: { profile: { firstName?: string | null; lastName?: string | null } | undefined }) {
  const { data: cards, refetch } = trpc.payments.listCards.useQuery();
  const removeCardMutation = trpc.payments.removeCard.useMutation({ onSuccess: () => refetch() });
  const setDefaultMutation = trpc.payments.setDefault.useMutation({ onSuccess: () => refetch() });

  return (
    <div className="space-y-8 max-w-2xl">
      <header>
        <h1 className="font-playfair text-4xl font-bold text-charcoal mb-2">Payment Methods</h1>
        <p className="text-muted leading-relaxed">Manage your cards for rental payments.</p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {cards && cards.length > 0 ? (
          cards.map((card) => (
            <div key={card.id} className={cn(
              "p-6 rounded-card relative overflow-hidden shadow-lg",
              card.isDefault ? "bg-charcoal text-white" : "bg-white border border-outline-variant text-charcoal"
            )}>
              <div className="absolute top-0 right-0 p-6 opacity-20">
                <CreditCard size={120} />
              </div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-10">
                  <span className={cn("font-mono text-xs uppercase tracking-widest", card.isDefault ? "text-white/60" : "text-muted")}>
                    {card.isDefault ? 'Primary Card' : card.brand}
                  </span>
                  <div className="flex gap-2">
                    {!card.isDefault && (
                      <button
                        onClick={() => setDefaultMutation.mutate({ cardId: card.id })}
                        className="text-xs font-bold text-terra hover:underline"
                      >
                        Set default
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm('Remove this card?')) removeCardMutation.mutate({ cardId: card.id });
                      }}
                      className={cn("text-xs font-bold hover:underline", card.isDefault ? "text-white/60" : "text-red-500")}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <p className={cn("font-mono text-xl tracking-[0.2em] mb-6", !card.isDefault && "text-charcoal")}>
                  **** **** **** {card.last4}
                </p>
                <div className="flex justify-between items-end mt-auto">
                  <div>
                    <p className={cn("font-mono text-[9px] uppercase mb-1", card.isDefault ? "text-white/40" : "text-muted")}>Card Holder</p>
                    <p className="font-bold text-sm uppercase">{profile?.firstName} {profile?.lastName}</p>
                  </div>
                  <div>
                    <p className={cn("font-mono text-[9px] uppercase mb-1", card.isDefault ? "text-white/40" : "text-muted")}>Expires</p>
                    <p className="font-bold text-sm">{String(card.expMonth).padStart(2, '0')}/{String(card.expYear).slice(-2)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : null}

        <button className="p-6 rounded-card border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center py-12 text-center hover:border-terra/40 transition-colors">
          <div className="w-12 h-12 rounded-full bg-sand flex items-center justify-center text-muted/30 mb-4">
            <Plus size={24} />
          </div>
          <h3 className="font-bold text-charcoal">Link a new card</h3>
          <p className="text-xs text-muted max-w-[200px] mt-1">Secured by Paystack. Your details are never stored on our servers.</p>
        </button>
      </div>
    </div>
  );
}
