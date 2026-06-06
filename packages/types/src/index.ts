export type Role = 'tenant' | 'landlord' | 'agent' | 'admin';

export type VerificationType =
  | 'nin'
  | 'lasrera'
  | 'esvarbon'
  | 'niesv'
  | 'aean'
  | 'ercaan'
  | 'redan'
  | 'property_title';

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export type VerificationBadge =
  | 'fully_verified'
  | 'title_confirmed'
  | 'agent_verified'
  | 'pending';

export type EscrowStatus =
  | 'pending_payment'
  | 'funds_held'
  | 'docs_verified'
  | 'key_handover_pending'
  | 'completed'
  | 'cancelled'
  | 'refunded'
  | 'disputed';

export type RentInstalmentStatus =
  | 'scheduled'
  | 'paid'
  | 'overdue'
  | 'missed';

export type RentScoreEventType =
  | 'on_time_payment'
  | 'late_payment'
  | 'missed_payment'
  | 'escrow_completed'
  | 'dispute_raised';

export type ReviewType = 'property' | 'landlord' | 'agent';

export type PropertyType = 'apartment' | 'duplex' | 'bungalow' | 'studio' | 'commercial';

export const PROFESSIONAL_BODIES: VerificationType[] = [
  'lasrera',
  'esvarbon',
  'niesv',
  'aean',
  'ercaan',
  'redan',
];

export const LGA_LIST = [
  'Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa',
  'Badagry', 'Epe', 'Eti-Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye',
  'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland',
  'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere',
] as const;
