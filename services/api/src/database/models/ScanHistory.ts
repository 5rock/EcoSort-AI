import mongoose, { Document, Schema } from 'mongoose';

export interface IScanHistory extends Document {
  userId: mongoose.Types.ObjectId;
  clientUuid: string; // The UUID from IndexedDB
  encryptedData: string; // The ciphertext of the scan record
  iv: string; // Initialization vector for encryption
  timestamp: number; // For conflict resolution (last-write-wins)
}

const ScanHistorySchema = new Schema<IScanHistory>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  clientUuid: { type: String, required: true },
  encryptedData: { type: String, required: true },
  iv: { type: String, required: true },
  timestamp: { type: Number, required: true }
});

// Index to ensure unique clientUuid per user, to handle upserts easily
ScanHistorySchema.index({ userId: 1, clientUuid: 1 }, { unique: true });

export const ScanHistory = mongoose.model<IScanHistory>('ScanHistory', ScanHistorySchema);
