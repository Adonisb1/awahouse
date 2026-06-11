import * as React from 'react';
import { cn } from '@/lib/utils/cn';
import { ShieldCheck, CheckCircle2, UserCheck, Search, Clock } from 'lucide-react';

export type BadgeType =
  | 'fully_verified'        // green shield + "Fully Verified"
  | 'title_confirmed'       // green shield + "Title Confirmed"
  | 'agent_verified'        // orange terra + "Agent Verified · {body}"
  | 'nin_verified'          // green + "NIN Verified"
  | 'transaction_verified'  // green + "Verified Review"
  | 'pending';               // grey + "Pending"

interface VerifiedBadgeProps {
  type: BadgeType;
  body?: string;
  size?: 'sm' | 'md';
  className?: string;
}

const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ type, body, size = 'md', className }) => {
  const config = {
    fully_verified: {
      label: 'Fully Verified',
      icon: ShieldCheck,
      styles: 'bg-success-bg border-success/25 text-success',
    },
    title_confirmed: {
      label: 'Title Confirmed',
      icon: ShieldCheck,
      styles: 'bg-success-bg border-success/25 text-success',
    },
    agent_verified: {
      label: `Agent Verified${body ? ` · ${body}` : ''}`,
      icon: UserCheck,
      styles: 'bg-terra-50 border-terra/20 text-terra-dark',
    },
    nin_verified: {
      label: 'NIN Verified',
      icon: CheckCircle2,
      styles: 'bg-success-bg border-success/25 text-success',
    },
    transaction_verified: {
      label: 'Verified Review',
      icon: Search,
      styles: 'bg-success-bg border-success/25 text-success',
    },
    pending: {
      label: 'Pending',
      icon: Clock,
      styles: 'bg-gray-100 border-gray-200 text-gray-500',
    },
  };

  const { label, icon: Icon, styles } = config[type];

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-badge border font-mono font-medium tracking-tight',
        styles,
        size === 'sm' ? 'text-[9px] px-2 py-0.5 gap-1' : 'text-[11px] px-2.5 py-1 gap-1.5',
        className
      )}
    >
      <Icon size={size === 'sm' ? 12 : 14} />
      <span>{label}</span>
    </div>
  );
};

export { VerifiedBadge };
