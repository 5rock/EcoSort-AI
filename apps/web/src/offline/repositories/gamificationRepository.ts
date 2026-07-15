import { db, type GamificationRecord } from '../db';

export const gamificationRepository = {
  async getProfile(userId: string): Promise<GamificationRecord> {
    const profile = await db.gamification.get(userId);
    if (profile) return profile;
    
    const newProfile: GamificationRecord = { userId, xp: 0, level: 1, badges: [] };
    await db.gamification.add(newProfile);
    return newProfile;
  },
  
  async addXP(userId: string, amount: number): Promise<GamificationRecord> {
    const profile = await this.getProfile(userId);
    profile.xp += amount;
    
    // Simple leveling logic (e.g. 100 XP per level)
    const newLevel = Math.floor(profile.xp / 100) + 1;
    if (newLevel > profile.level) {
      profile.level = newLevel;
    }
    
    await db.gamification.put(profile);
    return profile;
  },

  async unlockBadge(userId: string, badgeId: string): Promise<GamificationRecord> {
    const profile = await this.getProfile(userId);
    if (!profile.badges.includes(badgeId)) {
      profile.badges.push(badgeId);
      await db.gamification.put(profile);
    }
    return profile;
  },
  
  async deleteProfile(userId: string): Promise<void> {
    await db.gamification.delete(userId);
  }
};
