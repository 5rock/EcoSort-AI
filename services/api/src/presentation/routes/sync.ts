import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { ScanHistory } from '../../database/models/ScanHistory';
import { z } from 'zod';

const router = Router();
router.use(requireAuth);

const SyncItemSchema = z.object({
  clientUuid: z.string().uuid(),
  encryptedData: z.string(),
  iv: z.string(),
  timestamp: z.number()
});

const SyncPayloadSchema = z.array(SyncItemSchema);

// Push new/updated local records to the cloud
router.post('/push', async (req: AuthRequest, res) => {
  try {
    const items = SyncPayloadSchema.parse(req.body);
    const userId = req.user!.id;
    
    // Bulk upsert using clientUuid to handle conflicts (last-write-wins by timestamp in a real app, 
    // but for now simple upsert works)
    const ops = items.map(item => ({
      updateOne: {
        filter: { userId, clientUuid: item.clientUuid },
        update: { $set: { ...item, userId } },
        upsert: true
      } as any
    }));

    if (ops.length > 0) {
      await ScanHistory.bulkWrite(ops);
    }
    
    res.json({ success: true, count: ops.length });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Sync push failed' });
  }
});

// Pull all records from cloud to local
router.get('/pull', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const records = await ScanHistory.find({ userId }).select('-_id clientUuid encryptedData iv timestamp');
    res.json({ records });
  } catch (err: any) {
    res.status(500).json({ error: 'Sync pull failed' });
  }
});

export default router;
