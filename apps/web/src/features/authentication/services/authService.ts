import { usersRepository } from '../../../offline/repositories/usersRepository';
import { hashPassword, verifyPassword } from './crypto';
import type { LoginFormData, SignupFormData } from '../validators/authSchema';
import { useAuthStore } from '../stores/authStore';

export const authService = {
  async signup(data: SignupFormData) {
    const existing = await usersRepository.getUserByEmail(data.email);
    if (existing) {
      throw new Error('User already exists');
    }
    const { hash, salt } = await hashPassword(data.password);
    const user = await usersRepository.createUser(data.email, hash, salt);
    
    useAuthStore.getState().setUser({
      id: user.id,
      email: user.email,
      name: data.name,
      role: 'user',
      createdAt: new Date(user.createdAt).toISOString(),
      lastLoginAt: new Date().toISOString()
    });
    return user;
  },

  async login(data: LoginFormData) {
    const user = await usersRepository.getUserByEmail(data.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    const isValid = await verifyPassword(data.password, user.passwordHash, user.salt);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    useAuthStore.getState().setUser({
      id: user.id,
      email: user.email,
      role: 'user',
      createdAt: new Date(user.createdAt).toISOString(),
      lastLoginAt: new Date().toISOString()
    });
    return user;
  },

  logout() {
    useAuthStore.getState().logout();
  }
};
