export type AuthMode = 'guest' | 'registered' | null;

export interface User {
  id: string;
  email?: string;
  isGuest: boolean;
}

export interface AuthState {
  mode: AuthMode;
  user: User | null;
  token: string | null;
  cloudSyncEnabled: boolean;
  
  // Actions
  setGuestSession: (guestId: string) => void;
  setRegisteredSession: (user: User, token: string) => void;
  setCloudSync: (enabled: boolean) => void;
  clearSession: () => void;
}
