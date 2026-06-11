import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'tenant' | 'landlord' | 'agent' | 'admin';

type AuthState = {
  userId: string | null;
  roles: Role[];
  activeRole: Role | null;
  pendingRole: Role | null;
  sessionToken: string | null;
  isAuthenticated: boolean;
  setAuth: (params: { userId: string; roles: Role[]; activeRole: Role; sessionToken?: string | null }) => void;
  setActiveRole: (role: Role) => void;
  setPendingRole: (role: Role | null) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      roles: [],
      activeRole: null,
      pendingRole: null,
      sessionToken: null,
      isAuthenticated: false,
      setAuth: ({ userId, roles, activeRole, sessionToken }) =>
        set({ userId, roles, activeRole, sessionToken: sessionToken ?? null, isAuthenticated: true, pendingRole: null }),
      setActiveRole: (activeRole) =>
        set({ activeRole }),
      setPendingRole: (pendingRole) =>
        set({ pendingRole }),
      clearAuth: () =>
        set({ userId: null, roles: [], activeRole: null, pendingRole: null, sessionToken: null, isAuthenticated: false }),
    }),
    { name: 'awahouse-auth' },
  ),
);
