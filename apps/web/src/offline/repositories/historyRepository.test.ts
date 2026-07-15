import { describe, it, expect, vi, beforeEach } from 'vitest';
import { historyRepository } from './historyRepository';
import { db } from '../db';

// Mock Dexie db
vi.mock('../db', () => ({
  db: {
    scans: {
      add: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
      bulkDelete: vi.fn(),
      toArray: vi.fn().mockResolvedValue([]),
      orderBy: vi.fn().mockReturnThis(),
      reverse: vi.fn().mockReturnThis()
    }
  }
}));

describe('historyRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should add a scan', async () => {
    const scan = { id: '1', category: 'Plastic' } as any;
    await historyRepository.addScan(scan);
    expect(db.scans.add).toHaveBeenCalledWith(scan);
  });

  it('should get scans by user', async () => {
    const scans = [{ id: '1', userId: 'user-1' }, { id: '2', userId: 'user-2' }];
    (db.scans.toArray as any).mockResolvedValue(scans);
    
    const result = await historyRepository.getScansByUser('user-1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('should clear scans for a specific user', async () => {
    const scans = [{ id: '1', userId: 'user-1' }, { id: '2', userId: 'user-2' }];
    (db.scans.toArray as any).mockResolvedValue(scans);

    await historyRepository.clearUserScans('user-1');
    expect(db.scans.bulkDelete).toHaveBeenCalledWith(['1']);
  });
});
