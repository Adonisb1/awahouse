export interface Agent {
  id: string;
  name: string;
  firm: string | null;
  avatarUrl: string | null;
  escrowCount: number;
  rating: number | null;
  isOnline: boolean;
  professionalBodies: Array<'LASRERA' | 'ESVARBON' | 'NIESV' | 'AEAN' | 'ERCAAN' | 'REDAN'>;
}

export const mockAgents: Agent[] = [
  {
    id: 'agent-001',
    name: 'Adebayo Okoro',
    firm: 'Iconic Real Estate',
    avatarUrl: null,
    escrowCount: 124,
    rating: 4.9,
    isOnline: true,
    professionalBodies: ['LASRERA', 'ESVARBON'],
  },
  {
    id: 'agent-002',
    name: 'Sarah Johnson',
    firm: 'Elite Properties',
    avatarUrl: null,
    escrowCount: 85,
    rating: 4.8,
    isOnline: false,
    professionalBodies: ['NIESV'],
  },
  {
    id: 'agent-003',
    name: 'Emeka Nwosu',
    firm: 'Prime Homes',
    avatarUrl: null,
    escrowCount: 42,
    rating: 4.6,
    isOnline: true,
    professionalBodies: ['AEAN', 'REDAN'],
  },
  {
    id: 'agent-004',
    name: 'Folake Ademola',
    firm: 'Royal Realty',
    avatarUrl: null,
    escrowCount: 15,
    rating: 4.4,
    isOnline: true,
    professionalBodies: ['ERCAAN'],
  }
];
