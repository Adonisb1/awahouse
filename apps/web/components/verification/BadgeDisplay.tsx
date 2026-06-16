'use client';

import { Shield, ShieldCheck, FileCheck, Clock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { VerificationBadge } from '@awahouse/types';

type BadgeDisplayProps = {
  badge: VerificationBadge;
  size?: 'sm' | 'md' | 'lg';
};

const config: Record<VerificationBadge, { label: string; icon: typeof Shield; color: string }> = {
  fully_verified: {
    label: 'Fully Verified',
    icon: ShieldCheck,
    color: 'text-success bg-success-bg',
  },
  title_confirmed: {
    label: 'Title Confirmed',
    icon: FileCheck,
    color: 'text-success bg-success-bg',
  },
  agent_verified: {
    label: 'Agent Verified',
    icon: Shield,
    color: 'text-orange-600 bg-orange-100',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'text-gray-500 bg-gray-100',
  },
};

const sizeMap = { sm: 'text-xs px-2 py-0.5 gap-1', md: 'text-sm px-3 py-1 gap-1.5', lg: 'text-base px-4 py-1.5 gap-2' };

export function BadgeDisplay({ badge, size = 'md' }: BadgeDisplayProps) {
  const cfg = config[badge];
  const Icon = cfg.icon;

  return (
    <span className={cn('inline-flex items-center rounded-full font-medium', cfg.color, sizeMap[size])}>
      <Icon className={cn(size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5')} />
      {cfg.label}
    </span>
  );
}
