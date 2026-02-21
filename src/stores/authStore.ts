import { create } from 'zustand';
import type { MeDto } from '@/types';

interface AuthState {
  user: MeDto | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

interface AuthActions {
  setAuth: (user: MeDto, accessToken: string | null) => void;
  setTokens: (accessToken: string | null) => void;
  setUser: (user: MeDto) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
};

export const useAuthStore = create<AuthStore>()((set) => ({
  ...initialState,

  setAuth: (user, accessToken) =>
    set({
      user,
      accessToken,
      isAuthenticated: Boolean(accessToken),
      isAdmin: user.role === 'Admin',
      isLoading: false,
    }),

  setTokens: (accessToken) =>
    set((state) => ({
      ...state,
      accessToken,
    })),

  setUser: (user) =>
    set((state) => ({
      ...state,
      user,
      isAdmin: user.role === 'Admin',
    })),

  logout: () =>
    set({
      ...initialState,
      isLoading: false,
    }),

  setLoading: (isLoading) => set({ isLoading }),
}));

// Selector hooks for better performance
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useIsAdmin = () => useAuthStore((state) => state.isAdmin);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
