import { db, type UserRecord } from '../db';
import { v4 as uuidv4 } from 'uuid';

export const usersRepository = {
  async createUser(email: string, passwordHash: string, salt: string): Promise<UserRecord> {
    const user: UserRecord = {
      id: uuidv4(),
      email,
      passwordHash,
      salt,
      createdAt: Date.now()
    };
    await db.users.add(user);
    return user;
  },

  async getUserByEmail(email: string): Promise<UserRecord | undefined> {
    return await db.users.where('email').equals(email).first();
  },

  async getUserById(id: string): Promise<UserRecord | undefined> {
    return await db.users.get(id);
  }
};
