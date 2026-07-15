import { db, type ScanHistoryRecord } from '../db';

export const historyRepository = {
  async getScansByUser(userId?: string): Promise<ScanHistoryRecord[]> {
    if (userId) {
      // For now we don't have an index on userId, so we filter in memory.
      // In a real app we'd add it to the schema: db.version(5).stores({ scans: '..., userId' })
      const all = await db.scans.orderBy('timestamp').reverse().toArray();
      return all.filter(s => s.userId === userId);
    }
    return await db.scans.orderBy('timestamp').reverse().toArray();
  },
  
  async addScan(scan: ScanHistoryRecord): Promise<void> {
    await db.scans.add(scan);
  },

  async deleteScan(id: string): Promise<void> {
    await db.scans.delete(id);
  },

  async clearUserScans(userId?: string): Promise<void> {
    if (userId) {
      const all = await db.scans.toArray();
      const toDelete = all.filter(s => s.userId === userId).map(s => s.id);
      await db.scans.bulkDelete(toDelete);
    } else {
      await db.scans.clear();
    }
  },
  
  async getStats(userId?: string) {
    const scans = await this.getScansByUser(userId);
    const categoryCount = scans.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalScans: scans.length,
      categoryCount
    };
  }
};
