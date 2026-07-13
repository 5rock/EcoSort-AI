import { db } from '../../../offline/db';
import { useAuthStore } from '../store/authStore';
import { generateGuestId } from '../utils/crypto';

export const guestService = {
  loginAsGuest: () => {
    const id = generateGuestId();
    useAuthStore.getState().setGuestSession(id);
    return id;
  },

  logoutGuest: async () => {
    // 1. Clear IndexedDB scan history
    await db.scans.clear();

    // 2. Clear LocalStorage caches & settings (except for rate limits or other unrelated global things)
    const keysToRemove = [
      'ecosort-settings',
      // Note: 'ecosort-auth-storage' will be overwritten by clearSession()
    ];
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // In case there are cached images or blobs in memory/localStorage, let's clear them.
    // If they were saved as base64 in IndexedDB, they're gone via `db.scans.clear()`.

    // 3. Clear auth session
    useAuthStore.getState().clearSession();
  }
};
