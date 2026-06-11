export interface Property {
  id: string;
  title: string;
  type: 'APARTMENT' | 'DUPLEX' | 'BUNGALOW' | 'STUDIO' | 'FLAT';
  lga: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  priceYearlyKobo: number;
  imageUrl: string | null;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'DOCS_SUBMITTED' | 'TITLE_CONFIRMED';
  rating: number | null;
  reviewCount: number;
  amenities: string[];
  description: string;
  agentId: string;
  isSaved: boolean;
}

export const mockProperties: Property[] = [
  {
    id: 'prop-001',
    title: 'Serene Heights Apartment',
    type: 'APARTMENT',
    lga: 'Eti-Osa',
    address: '14 Admiralty Way, Lekki Phase 1, Lagos',
    bedrooms: 3,
    bathrooms: 3,
    areaSqm: 180,
    priceYearlyKobo: 450000000,
    imageUrl: null,
    verificationStatus: 'VERIFIED',
    rating: 4.9,
    reviewCount: 23,
    amenities: ['Pool', 'Gym', '24/7 Security', 'Parking', 'Fibre Internet'],
    description: 'A beautifully finished apartment with modern amenities in the heart of Lekki.',
    agentId: 'agent-001',
    isSaved: false,
  },
  {
    id: 'prop-002',
    title: 'Azure Waterfront Villa',
    type: 'DUPLEX',
    lga: 'Lagos Island',
    address: '22 Banana Island, Ikoyi, Lagos',
    bedrooms: 5,
    bathrooms: 6,
    areaSqm: 450,
    priceYearlyKobo: 1200000000,
    imageUrl: null,
    verificationStatus: 'TITLE_CONFIRMED',
    rating: 4.8,
    reviewCount: 15,
    amenities: ['Pool', 'Gym', 'Ocean View', 'Smart Home', 'EV Charging'],
    description: 'Ultra-luxury waterfront duplex with breathtaking views.',
    agentId: 'agent-002',
    isSaved: true,
  },
  {
    id: 'prop-003',
    title: 'Heritage Estate Duplex',
    type: 'DUPLEX',
    lga: 'Ikeja',
    address: '5 GRA Ikeja, Lagos',
    bedrooms: 4,
    bathrooms: 4,
    areaSqm: 320,
    priceYearlyKobo: 650000000,
    imageUrl: null,
    verificationStatus: 'VERIFIED',
    rating: 4.7,
    reviewCount: 10,
    amenities: ['24/7 Security', 'Parking', 'Generator', 'Garden'],
    description: 'Classic duplex in a secure and quiet neighborhood.',
    agentId: 'agent-001',
    isSaved: false,
  },
  {
    id: 'prop-004',
    title: 'Skyline Studio',
    type: 'STUDIO',
    lga: 'Surulere',
    address: '10 Adeniran Ogunsanya, Surulere, Lagos',
    bedrooms: 1,
    bathrooms: 1,
    areaSqm: 45,
    priceYearlyKobo: 150000000,
    imageUrl: null,
    verificationStatus: 'VERIFIED',
    rating: 4.5,
    reviewCount: 32,
    amenities: ['Fibre Internet', 'Parking', 'Security'],
    description: 'Modern studio apartment perfect for young professionals.',
    agentId: 'agent-003',
    isSaved: false,
  },
  {
    id: 'prop-005',
    title: 'Oakwood Family Home',
    type: 'BUNGALOW',
    lga: 'Alimosho',
    address: '15 Egbeda Road, Alimosho, Lagos',
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 200,
    priceYearlyKobo: 220000000,
    imageUrl: null,
    verificationStatus: 'PENDING',
    rating: 4.2,
    reviewCount: 5,
    amenities: ['Parking', 'Security', 'Water Supply'],
    description: 'Spacious bungalow with a large backyard.',
    agentId: 'agent-004',
    isSaved: false,
  },
  {
    id: 'prop-006',
    title: 'The Obsidian Suite',
    type: 'APARTMENT',
    lga: 'Lagos Island',
    address: 'Old Ikoyi, Lagos Island',
    bedrooms: 4,
    bathrooms: 5.5,
    areaSqm: 420,
    priceYearlyKobo: 18500000000,
    imageUrl: null,
    verificationStatus: 'VERIFIED',
    rating: 4.9,
    reviewCount: 23,
    amenities: ['Pool', 'Gym', 'EV Chg', '24/7'],
    description: 'Experience the zenith of luxury in this Obsidian Suite.',
    agentId: 'agent-001',
    isSaved: false,
  }
];
