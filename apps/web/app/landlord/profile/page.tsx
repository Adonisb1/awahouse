'use client';

import { useRouter } from 'next/navigation';
import { User, Settings, HelpCircle, LogOut } from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';

export default function LandlordProfilePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-sand">
      <TopNav variant="back" title="Profile" onBack={() => router.push('/landlord')} />

      <div className="flex-1 px-4 py-6">
        <div className="flex flex-col items-center mb-10">
          <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <User className="h-10 w-10 text-primary" />
          </div>
          <h2 className="font-display text-xl font-bold text-charcoal">Landlord</h2>
          <p className="text-sm text-charcoal/60">Manage your account</p>
        </div>

        <div className="space-y-2">
          <button className="flex w-full items-center gap-3 rounded-card bg-white px-4 py-3 text-left shadow-sm">
            <Settings className="h-5 w-5 text-charcoal/60" />
            <span className="font-body text-sm text-charcoal">Settings</span>
          </button>
          <button className="flex w-full items-center gap-3 rounded-card bg-white px-4 py-3 text-left shadow-sm">
            <HelpCircle className="h-5 w-5 text-charcoal/60" />
            <span className="font-body text-sm text-charcoal">Help & Support</span>
          </button>
          <button className="flex w-full items-center gap-3 rounded-card bg-white px-4 py-3 text-left shadow-sm text-red-500">
            <LogOut className="h-5 w-5" />
            <span className="font-body text-sm">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
