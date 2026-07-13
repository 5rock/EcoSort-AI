import { db } from '../../../offline/db';
import { hashPassword, verifyPassword, generateToken, generateSalt } from '../utils/crypto';
import { useAuthStore } from '../store/authStore';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const RATE_LIMIT_KEY = 'ecosort_auth_attempts';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

interface RateLimitData {
  attempts: number;
  lockUntil: number;
}

function checkRateLimit() {
  const dataStr = localStorage.getItem(RATE_LIMIT_KEY);
  if (!dataStr) return;

  const data: RateLimitData = JSON.parse(dataStr);
  if (data.lockUntil > Date.now()) {
    const minutesLeft = Math.ceil((data.lockUntil - Date.now()) / 60000);
    throw new Error(`Too many attempts. Please try again in ${minutesLeft} minutes.`);
  }

  // Reset if lockout expired
  if (data.lockUntil > 0 && data.lockUntil <= Date.now()) {
    localStorage.removeItem(RATE_LIMIT_KEY);
  }
}

function recordFailedAttempt() {
  const dataStr = localStorage.getItem(RATE_LIMIT_KEY);
  const data: RateLimitData = dataStr ? JSON.parse(dataStr) : { attempts: 0, lockUntil: 0 };
  
  data.attempts += 1;
  if (data.attempts >= MAX_ATTEMPTS) {
    data.lockUntil = Date.now() + LOCKOUT_MS;
  }
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
}

function clearRateLimit() {
  localStorage.removeItem(RATE_LIMIT_KEY);
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const authService = {
  register: async (email: string, password: string) => {
    checkRateLimit();
    await delay(600); // Simulate network delay
    
    const cleanEmail = email.trim();
    
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      throw new Error('Please enter a valid email address.');
    }

    if (!password || password.length < 8 || password.length > 100) {
      throw new Error('Password must be between 8 and 100 characters.');
    }

    const existingUser = await db.users.where('email').equalsIgnoreCase(cleanEmail).first();
    if (existingUser) {
      // Intentionally not recording as a failed attempt to avoid locking out legitimate users who forgot they signed up
      throw new Error('An account with this email already exists.');
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);
    const newUser = {
      id: crypto.randomUUID(),
      email: cleanEmail,
      passwordHash,
      salt,
      createdAt: Date.now()
    };

    await db.users.add(newUser);
    clearRateLimit();

    const token = generateToken();
    useAuthStore.getState().setRegisteredSession({ id: newUser.id, email: cleanEmail, isGuest: false }, token);
  },

  login: async (email: string, password: string) => {
    checkRateLimit();
    await delay(500);

    const cleanEmail = email.trim();
    const user = await db.users.where('email').equalsIgnoreCase(cleanEmail).first();
    
    if (!user) {
      recordFailedAttempt();
      throw new Error('Invalid email or password.');
    }

    const isValid = await verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      recordFailedAttempt();
      throw new Error('Invalid email or password.');
    }

    clearRateLimit();
    const token = generateToken();
    useAuthStore.getState().setRegisteredSession({ id: user.id, email: cleanEmail, isGuest: false }, token);
  },

  logout: async () => {
    useAuthStore.getState().clearSession();
  }
};
