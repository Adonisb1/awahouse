import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AuthState = {
  userId: string | null;
  role: 'tenant' | 'landlord' | 'agent' | 'admin' | null;
  sessionToken: string | null;
  isAuthenticated: boolean;
  setAuth: (params: { userId: string; role: AuthState['role']; sessionToken?: string | null }) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      role: null,
      sessionToken: null,
      isAuthenticated: false,
      setAuth: ({ userId, role, sessionToken }) =>
        set({ userId, role, sessionToken: sessionToken ?? null, isAuthenticated: true }),
      clearAuth: () =>
        set({ userId: null, role: null, sessionToken: null, isAuthenticated: false }),
    }),
    { name: 'awahouse-auth' },
  ),
);
