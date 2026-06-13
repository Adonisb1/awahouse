'use client';

import { Bell, Moon, Info, ChevronRight } from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';

const SETTINGS = [
  {
    icon: Bell,
    label: 'Notification Preferences',
    description: 'Manage how and when you receive notifications',
    soon: true,
  },
  {
    icon: Moon,
    label: 'Appearance',
    description: 'Theme, font size, and display options',
    soon: true,
  },
  {
    icon: Info,
    label: 'About Awahouse',
    description: 'Version 1.0.0 — Verified Property Marketplace',
  },
];

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-sand">
      <TopNav variant="back" title="App Settings" />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white border border-outline-variant rounded-card overflow-hidden shadow-sm">
          {SETTINGS.map((item, i) => (
            <div
              key={i}
              className="p-4 flex items-center justify-between border-b border-outline-variant/30 last:border-0"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-sand flex items-center justify-center text-muted">
                  <item.icon size={20} />
                </div>
                <div>
                  <span className="font-bold text-charcoal text-sm flex items-center gap-2">
                    {item.label}
                    {item.soon && (
                      <span className="text-[9px] font-mono uppercase tracking-widest text-terra bg-terra/10 px-2 py-0.5 rounded-badge">
                        Soon
                      </span>
                    )}
                  </span>
                  <p className="text-xs text-muted mt-0.5">{item.description}</p>
                </div>
              </div>
              {!item.soon && <ChevronRight size={18} className="text-muted/50" />}
            </div>
          ))}
        </div>

        <p className="text-[10px] font-mono text-muted text-center mt-8">
          Awahouse v1.0.0 &middot; Built with Next.js &middot; &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
