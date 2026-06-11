export type EscrowStatus =
  | 'PENDING_PAYMENT'
  | 'FUNDS_HELD'
  | 'DOCS_VERIFIED'
  | 'KEY_HANDOVER_PENDING'
  | 'DISPUTED'
  | 'COMPLETED'
  | 'REFUNDED'
  | 'CANCELLED';

export interface EscrowTransaction {
  id: string;
  propertyId: string;
  propertyTitle: string;
  tenantName: string;
  landlordName: string;
  amountKobo: number;
  platformFeeKobo: number;
  status: EscrowStatus;
  handoverDate: string;
  createdAt: string;
}

export const mockEscrowTransactions: EscrowTransaction[] = [
  {
    id: 'escrow-001',
    propertyId: 'prop-002',
    propertyTitle: '3-Bed Flat, Lekki Phase 1',
    tenantName: 'Martins A.',
    landlordName: 'Chief Benson Okafor',
    amountKobo: 250000000,
    platformFeeKobo: 3750000,
    status: 'KEY_HANDOVER_PENDING',
    handoverDate: '2024-10-28',
    createdAt: '2024-10-12',
  },
  {
    id: 'escrow-002',
    propertyId: 'prop-001',
    propertyTitle: 'Serene Heights Apartment',
    tenantName: 'Martins A.',
    landlordName: 'Chief Benson Okafor',
    amountKobo: 450000000,
    platformFeeKobo: 6750000,
    status: 'COMPLETED',
    handoverDate: '2024-09-15',
    createdAt: '2024-09-01',
  },
  {
    id: 'escrow-003',
    propertyId: 'prop-003',
    propertyTitle: 'Heritage Estate Duplex',
    tenantName: 'Martins A.',
    landlordName: 'Chief Benson Okafor',
    amountKobo: 650000000,
    platformFeeKobo: 9750000,
    status: 'FUNDS_HELD',
    handoverDate: '2024-11-05',
    createdAt: '2024-10-20',
  }
];
