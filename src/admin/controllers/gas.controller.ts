import { Request, Response } from 'express';
import { gasService } from '../services/gas.service';

class AdminGasController {
  async topUpAll(req: Request, res: Response): Promise<Response> {
    try {
      const { amount } = req.body;
      if (!amount) return res.status(400).json({ success: false, error: 'amount (ETH) is required' });

      const numeric = parseFloat(String(amount));
      if (isNaN(numeric) || numeric <= 0) return res.status(400).json({ success: false, error: 'amount must be a positive number' });

      const result = await gasService.topUpAll(String(amount));
      if (!result.success) return res.status(500).json({ success: false, error: result.error || 'Failed to perform gas top-up' });

      const summary = {
        totalChecked: result.details.length,
        totalToppedUp: result.details.filter(d => d.topUpPerformed).length,
        details: result.details.map(d => ({ user_id: d.user_id, wallet_id: d.wallet_id, wallet_address: d.wallet_address, balanceWei: d.balanceWei, neededWei: d.neededWei, topUpPerformed: d.topUpPerformed, txHash: d.txHash, error: d.error }))
      };

      return res.status(200).json({ success: true, data: summary });
    } catch (err: any) {
      console.error('AdminGasController.topUpAll error:', err);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}

export const adminGasController = new AdminGasController();
