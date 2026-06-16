import { Building2, User } from 'lucide-react';
import Link from 'next/link';
import { RoleSwitcher } from '@/components/ui/RoleSwitcher';

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <main>{children}</main>
    </div>
  );
}
