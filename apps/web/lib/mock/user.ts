export interface User {
  id: string;
  name: string;
  role: 'TENANT' | 'LANDLORD' | 'AGENT';
  isNinVerified: boolean;
  avatarUrl: string | null;
}

export const mockUser: User = {
  id: 'user-001',
  name: 'Martins A.',
  role: 'TENANT',
  isNinVerified: true,
  avatarUrl: null,
};
