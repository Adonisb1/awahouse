import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export type EscrowStatus =
  | 'pending_payment'
  | 'funds_held'
  | 'docs_verified'
  | 'key_handover_pending'
  | 'disputed'
  | 'completed'
  | 'refunded'
  | 'cancelled';

interface EscrowStatusChipProps {
  status: EscrowStatus;
  className?: string;
}

const config: Record<EscrowStatus, { label: string; styles: string }> = {
  pending_payment: {
    label: 'Awaiting Payment',
    styles: 'bg-gray-100 text-gray-600',
  },
  funds_held: {
    label: 'Funds Secured',
    styles: 'bg-blue-50 text-blue-700',
  },
  docs_verified: {
    label: 'Docs Verified',
    styles: 'bg-terra-50 text-terra-dark',
  },
  key_handover_pending: {
    label: 'Handover Pending',
    styles: 'bg-amber-50 text-amber-700',
  },
  disputed: {
    label: 'Disputed',
    styles: 'bg-red-50 text-red-700',
  },
  completed: {
    label: 'Completed',
    styles: 'bg-success-bg text-success',
  },
  refunded: {
    label: 'Refunded',
    styles: 'bg-gray-100 text-gray-600',
  },
  cancelled: {
    label: 'Cancelled',
    styles: 'bg-gray-100 text-gray-400',
  },
};

const EscrowStatusChip: React.FC<EscrowStatusChipProps> = ({ status, className }) => {
  const { label, styles } = config[status];

  return (
    <div
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-mono font-bold tracking-tight border border-current opacity-90',
        styles,
        className
      )}
    >
      {label}
    </div>
  );
};

export { EscrowStatusChip };
