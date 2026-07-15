import Dexie, { type EntityTable } from 'dexie';

export interface ScanHistoryRecord {
  id: string; // uuid
  timestamp: number;
  category: string;
  confidence: number;
  region: string;
  bin: string;
  synced: boolean;
  
  // New RC2 fields
  ecoScore?: number;
  carbonSaved?: number;
  waterSaved?: number;
  energySaved?: number;
  xpEarned?: number;
  
  thumbnail?: string; // base64 jpeg
  originalImage?: string; // base64
  instructions?: string[];
  impact?: string;
  warnings?: string;
  modelVersion?: string;
  processingTime?: number; // ms
  device?: string; // backend used e.g. WebGPU
  userId?: string; // To differentiate between guest and authenticated users
}

export interface UserRecord {
  id: string; // uuid
  email: string;
  passwordHash: string; // PBKDF2 hash
  salt: string; // Cryptographically secure random salt
  createdAt: number;
}

export interface GamificationRecord {
  userId: string;
  xp: number;
  level: number;
  badges: string[];
}

// Renamed DB to force a clean wipe for RC2
const db = new Dexie('EcoSortDB_RC2') as Dexie & {
  scans: EntityTable<ScanHistoryRecord, 'id'>;
  users: EntityTable<UserRecord, 'id'>;
  gamification: EntityTable<GamificationRecord, 'userId'>;
};

db.version(1).stores({
  scans: 'id, timestamp, category, region, synced, userId',
  users: 'id, email',
  gamification: 'userId'
});

export { db };
