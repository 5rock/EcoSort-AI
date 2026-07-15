import { create } from 'zustand';
import type { AuthState, User } from '../types/auth';

interface AuthStore extends AuthState {
  setGuest: (guestId: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isGuest: false,
  isLoading: false,
  error: null,
  
  setGuest: (guestId) => set({
    isGuest: true,
    isAuthenticated: true,
    user: {
      id: guestId,
      role: 'guest',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    }
  }),
  setUser: (user) => set({ user, isAuthenticated: true, isGuest: false }),
  logout: () => set({ user: null, isAuthenticated: false, isGuest: false })
}));
