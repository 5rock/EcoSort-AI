import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState } from '../types/auth';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      mode: null,
      user: null,
      token: null,
      cloudSyncEnabled: false,

      setGuestSession: (guestId) =>
        set({
          mode: 'guest',
          user: { id: guestId, isGuest: true },
          token: null, // Guests don't need a secure JWT token for our mock
          cloudSyncEnabled: false, // Guests cannot cloud sync
        }),

      setRegisteredSession: (user, token) =>
        set({
          mode: 'registered',
          user,
          token,
          // Cloud sync remains whatever it was set to, or defaults to false
        }),

      setCloudSync: (enabled) =>
        set({
          cloudSyncEnabled: enabled,
        }),

      clearSession: () =>
        set({
          mode: null,
          user: null,
          token: null,
          cloudSyncEnabled: false,
        }),
    }),
    {
      name: 'ecosort-auth-storage', // Key for LocalStorage
    }
  )
);
