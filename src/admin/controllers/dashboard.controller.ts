import { Request, Response } from 'express';
import { adminDashboardService } from '../services/dashboard.service';
import { AdminRequest } from '../middleware/admin.middleware';

export class AdminDashboardController {
  async summary(req: AdminRequest, res: Response) {
    try {
      const result = await adminDashboardService.getSummary();
      if (!result.success) return res.status(500).json(result);
      return res.json(result);
    } catch (error: any) {
      console.error('Error in AdminDashboardController.summary:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch dashboard summary' });
    }
  }

  async recentTransactions(req: AdminRequest, res: Response) {
    try {
      const limit = parseInt((req.query.limit as string) || '10', 10);
      const result = await adminDashboardService.getRecentTransactions(limit);
      if (!result.success) return res.status(500).json(result);
      return res.json(result);
    } catch (error: any) {
      console.error('Error in AdminDashboardController.recentTransactions:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch recent transactions' });
    }
  }

  async health(req: AdminRequest, res: Response) {
    try {
      const result = await adminDashboardService.getHealthStatus();
      if (!result.success) return res.status(500).json(result);
      return res.json(result);
    } catch (error: any) {
      console.error('Error in AdminDashboardController.health:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch health status' });
    }
  }
}

export const adminDashboardController = new AdminDashboardController();
