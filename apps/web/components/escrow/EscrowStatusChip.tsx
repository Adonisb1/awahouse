import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export type EscrowStatus =
  | 'PENDING_PAYMENT'
  | 'FUNDS_HELD'
  | 'DOCS_VERIFIED'
  | 'KEY_HANDOVER_PENDING'
  | 'DISPUTED'
  | 'COMPLETED'
  | 'REFUNDED'
  | 'CANCELLED';

interface EscrowStatusChipProps {
  status: EscrowStatus;
  className?: string;
}

const EscrowStatusChip: React.FC<EscrowStatusChipProps> = ({ status, className }) => {
  const config: Record<EscrowStatus, { label: string; styles: string }> = {
    PENDING_PAYMENT: {
      label: 'Awaiting Payment',
      styles: 'bg-gray-100 text-gray-600',
    },
    FUNDS_HELD: {
      label: 'Funds Secured',
      styles: 'bg-blue-50 text-blue-700',
    },
    DOCS_VERIFIED: {
      label: 'Docs Verified',
      styles: 'bg-terra-50 text-terra-dark',
    },
    KEY_HANDOVER_PENDING: {
      label: 'Handover Pending',
      styles: 'bg-amber-50 text-amber-700',
    },
    DISPUTED: {
      label: 'Disputed',
      styles: 'bg-red-50 text-red-700',
    },
    COMPLETED: {
      label: 'Completed',
      styles: 'bg-success-bg text-success',
    },
    REFUNDED: {
      label: 'Refunded',
      styles: 'bg-gray-100 text-gray-600',
    },
    CANCELLED: {
      label: 'Cancelled',
      styles: 'bg-gray-100 text-gray-400',
    },
  };

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
