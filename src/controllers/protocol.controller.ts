import { Request, Response } from 'express';
import { protocolService } from '../services/protocol.service';

export class ProtocolController {
  async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = await protocolService.getStatus();
      res.json({ success: true, data: status });
    } catch (err) {
      console.error('Protocol status error:', err);
      res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Unknown error' });
    }
  }
}

export const protocolController = new ProtocolController();
