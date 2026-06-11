'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Compass, 
  ShieldCheck, 
  PlusCircle, 
  Mail, 
  User, 
  LayoutDashboard, 
  Building, 
  Users 
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type UserRole = 'TENANT' | 'LANDLORD' | 'AGENT';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
}

const BottomNav: React.FC<{ role: UserRole }> = ({ role }) => {
  const pathname = usePathname();

  const tenantTabs: NavItem[] = [
    { id: 'explore', label: 'Explore', icon: Compass, href: '/explore' },
    { id: 'escrow', label: 'Escrow', icon: ShieldCheck, href: '/escrow' },
    { id: 'post', label: 'Post', icon: PlusCircle, href: '/post' },
    { id: 'inbox', label: 'Inbox', icon: Mail, href: '/inbox' },
    { id: 'profile', label: 'Profile', icon: User, href: '/profile' },
  ];

  const landlordTabs: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/landlord' },
    { id: 'listings', label: 'Listings', icon: Building, href: '/landlord/listings' },
    { id: 'post', label: 'Post', icon: PlusCircle, href: '/landlord/listings/create' },
    { id: 'escrow', label: 'Escrow', icon: ShieldCheck, href: '/landlord/escrow' },
    { id: 'profile', label: 'Profile', icon: User, href: '/landlord/profile' },
  ];

  const agentTabs: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/agent' },
    { id: 'listings', label: 'Listings', icon: Building, href: '/agent/listings' },
    { id: 'post', label: 'Post', icon: PlusCircle, href: '/agent/listings/create' },
    { id: 'clients', label: 'Clients', icon: Users, href: '/agent/clients' },
    { id: 'profile', label: 'Profile', icon: User, href: '/agent/profile' },
  ];

  const tabs = role === 'TENANT' ? tenantTabs : role === 'LANDLORD' ? landlordTabs : agentTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-outline-variant h-[68px] pb-safe">
      <div className="flex items-center justify-around h-full px-2">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 gap-1 transition-colors relative',
                isActive ? 'text-terra' : 'text-muted'
              )}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 bg-terra rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export { BottomNav };
