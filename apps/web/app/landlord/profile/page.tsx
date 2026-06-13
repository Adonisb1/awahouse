'use client';

import { useRouter } from 'next/navigation';
import { User, Settings, LogOut, Mail, Phone } from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';
import { trpc } from '@/lib/trpc/react';

export default function LandlordProfilePage() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: profile, isLoading } = trpc.auth.getProfile.useQuery();
  const signOutMutation = trpc.auth.signOut.useMutation({
    onSuccess: () => {
      localStorage.removeItem('awahouse-auth');
      utils.invalidate();
      router.push('/login');
    },
  });

  return (
    <div className="flex flex-col min-h-screen bg-sand">
      <TopNav variant="back" title="Profile" onBack={() => router.push('/landlord')} />

      <div className="flex-1 px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center mb-10">
              <div className="mb-3 h-20 w-20 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mt-2" />
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center mb-10">
              <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-primary" />
                )}
              </div>
              <h2 className="font-display text-xl font-bold text-charcoal">
                {profile?.firstName ?? profile?.email ?? 'User'}
              </h2>
              <div className="flex items-center gap-3 mt-1 text-sm text-charcoal/60">
                {profile?.email && (
                  <span className="flex items-center gap-1">
                    <Mail size={14} /> {profile.email}
                  </span>
                )}
                {profile?.phone && (
                  <span className="flex items-center gap-1">
                    <Phone size={14} /> {profile.phone}
                  </span>
                )}
              </div>
              {profile?.landlordProfile?.firmName && (
                <p className="text-sm text-charcoal/40 mt-1">{profile.landlordProfile.firmName}</p>
              )}
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <button
                className="flex w-full items-center gap-3 rounded-card bg-white px-4 py-3 text-left shadow-sm hover:bg-gray-50 transition-colors"
                onClick={() => router.push('/landlord/settings')}
              >
                <Settings className="h-5 w-5 text-charcoal/60" />
                <span className="font-body text-sm text-charcoal">Settings</span>
              </button>
              <button
                className="flex w-full items-center gap-3 rounded-card bg-white px-4 py-3 text-left shadow-sm hover:bg-gray-50 transition-colors"
                onClick={() => router.push('/landlord/listings')}
              >
                <User className="h-5 w-5 text-charcoal/60" />
                <span className="font-body text-sm text-charcoal">My Listings</span>
              </button>
              <button
                className="flex w-full items-center gap-3 rounded-card bg-white px-4 py-3 text-left shadow-sm text-red-500 hover:bg-red-50 transition-colors"
                onClick={() => signOutMutation.mutate()}
              >
                <LogOut className="h-5 w-5" />
                <span className="font-body text-sm">Sign Out</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
