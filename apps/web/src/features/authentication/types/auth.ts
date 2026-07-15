export type UserRole = 'guest' | 'user' | 'admin';

export interface User {
  id: string;
  email?: string;
  name?: string;
  role: UserRole;
  createdAt: string;
  lastLoginAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  error: string | null;
}
