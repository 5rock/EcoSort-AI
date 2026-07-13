import Dexie, { type EntityTable } from 'dexie';

export interface ScanHistoryRecord {
  id: string; // uuid
  timestamp: number;
  category: string;
  confidence: number;
  region: string;
  bin: string;
  synced: boolean;
  
  // New fields from redesign
  thumbnail?: string; // base64 jpeg
  originalImage?: string; // base64
  instructions?: string[];
  impact?: string;
  warnings?: string;
  modelVersion?: string;
  processingTime?: number; // ms
  device?: string; // backend used e.g. WebGPU
}

export interface UserRecord {
  id: string; // uuid
  email: string;
  passwordHash: string; // PBKDF2 hash
  salt: string; // Cryptographically secure random salt
  createdAt: number;
}

const db = new Dexie('EcoSortDB') as Dexie & {
  scans: EntityTable<ScanHistoryRecord, 'id'>;
  users: EntityTable<UserRecord, 'id'>;
};

db.version(2).stores({
  scans: 'id, timestamp, category, region, synced' 
});

db.version(3).stores({
  users: 'id, email' // We only index fields we query by
});

db.version(4).upgrade(() => {
  // Version 4 adds 'salt' to users, but Dexie doesn't require schema changes for unindexed properties.
  // We just bump the version to document the change and run any migrations if needed.
});

export { db };
