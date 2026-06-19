'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface ProfileSidebarLayoutProps {
  userHeader: React.ReactNode;
  workspaceSwitcher: React.ReactNode;
  menuItems: SidebarItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  onSignOut: () => void;
  onBack?: () => void;
  children: React.ReactNode;
}

export function ProfileSidebarLayout({
  userHeader,
  workspaceSwitcher,
  menuItems,
  activeTab,
  onTabChange,
  onSignOut,
  onBack,
  children
}: ProfileSidebarLayoutProps) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-sand">
      {/* Sidebar */}
      <aside className="w-full md:w-[320px] lg:w-[380px] md:sticky md:top-0 md:h-screen bg-white border-r border-outline-variant/30 flex flex-col overflow-hidden shadow-sm z-20">
        <div className="flex-1 overflow-y-auto no-scrollbar py-8 px-6">
          {/* Back Action */}
          {onBack && (
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-muted hover:text-terra transition-colors mb-8 font-bold text-xs uppercase tracking-widest group"
            >
              <div className="w-8 h-8 rounded-full bg-sand flex items-center justify-center group-hover:bg-terra group-hover:text-white transition-colors">
                <ChevronLeft size={16} />
              </div>
              Back to Dashboard
            </button>
          )}

          {/* User Summary */}
          <div className="mb-10">
            {userHeader}
          </div>

          {/* Workspace Switcher */}
          <div className="mb-10">
            {workspaceSwitcher}
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1.5">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted mb-4 px-1">Menu</h3>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "w-full p-4 rounded-xl flex items-center justify-between transition-all group",
                    isActive 
                      ? "bg-terra text-white shadow-md" 
                      : "text-charcoal hover:bg-sand/50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                      isActive ? "bg-white/20" : "bg-sand"
                    )}>
                      <Icon size={20} />
                    </div>
                    <span className="font-bold text-sm">{item.label}</span>
                  </div>
                  <ChevronRight 
                    size={18} 
                    className={cn(
                      "transition-transform",
                      isActive ? "rotate-90 text-white" : "text-muted/50 group-hover:translate-x-1"
                    )} 
                  />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-6 border-t border-outline-variant/30 bg-gray-50/50">
          <Button
            variant="ghost"
            fullWidth
            onClick={onSignOut}
            className="text-red-500 hover:bg-red-50 justify-start px-4 gap-4"
          >
            <LogOut size={20} />
            <span className="font-bold">Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-sand p-6 md:p-10 xl:p-16">
        <div className="w-full max-w-6xl mx-auto h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
