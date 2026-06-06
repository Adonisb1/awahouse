import { Building2 } from 'lucide-react';
import Link from 'next/link';

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-50 border-b border-charcoal/5 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link href="/agent/listings" className="flex items-center gap-2 font-display text-xl italic font-black text-primary">
            <Building2 className="h-5 w-5" /> Awa
          </Link>
          <span className="font-body text-sm text-charcoal/40">Agent</span>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
