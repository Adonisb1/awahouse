export interface Review {
  id: string;
  authorName: string;
  authorInitials: string;
  authorAvatarUrl: string | null;
  rating: number;
  body: string;
  createdAt: string;
  isVerifiedTransaction: boolean;
  helpfulCount: number;
}

export const mockReviews: Review[] = [
  {
    id: 'rev-001',
    authorName: 'James D.',
    authorInitials: 'JD',
    authorAvatarUrl: null,
    rating: 5,
    body: 'Absolutely wonderful apartment. The escrow process was seamless and I felt protected the whole time. Highly recommended!',
    createdAt: 'Oct 2023',
    isVerifiedTransaction: true,
    helpfulCount: 12,
  },
  {
    id: 'rev-002',
    authorName: 'Bisi A.',
    authorInitials: 'BA',
    authorAvatarUrl: null,
    rating: 4,
    body: 'The apartment is exactly as shown in the pictures. The agent was very professional.',
    createdAt: 'Sep 2023',
    isVerifiedTransaction: true,
    helpfulCount: 5,
  },
  {
    id: 'rev-003',
    authorName: 'Chidi O.',
    authorInitials: 'CO',
    authorAvatarUrl: null,
    rating: 5,
    body: 'Verified properties really give peace of mind. No more worrying about fake listings.',
    createdAt: 'Aug 2023',
    isVerifiedTransaction: true,
    helpfulCount: 8,
  }
];
