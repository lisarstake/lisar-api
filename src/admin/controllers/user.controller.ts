import { Response } from 'express';
import { AdminRequest } from '../middleware/admin.middleware';
import { adminUserService, UserFilters } from '../services/user.service';

export class AdminUserController {
  /**
   * Get all users with pagination and filters
   * GET /admin/users
   */
  async getUsers(req: AdminRequest, res: Response) {
    try {
      const filters: UserFilters = {
        search: req.query.search as string,
        status: req.query.status as 'active' | 'suspended' | 'all',
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 50,
        sortBy: req.query.sortBy as 'created_at' | 'lpt_balance' | 'user_id',
        sortOrder: req.query.sortOrder as 'asc' | 'desc'
      };

      const result = await adminUserService.getAllUsers(filters);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }

      return res.json({
        success: true,
        data: result.data,
        message: 'Users retrieved successfully'
      });
    } catch (error: any) {
      console.error('Error in getUsers:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get user details by ID
   * GET /admin/users/:userId
   */
  async getUserDetails(req: AdminRequest, res: Response) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      const result = await adminUserService.getUserById(userId);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          error: result.error
        });
      }

      return res.json({
        success: true,
        data: result.data,
        message: 'User details retrieved successfully'
      });
    } catch (error: any) {
      console.error('Error in getUserDetails:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Suspend a user
   * POST /admin/users/:userId/suspend
   */
  async suspendUser(req: AdminRequest, res: Response) {
    try {
      const { userId } = req.params;
      const { reason } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      if (!reason || reason.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Suspension reason is required'
        });
      }

      if (!req.admin) {
        return res.status(401).json({
          success: false,
          error: 'Admin authentication required'
        });
      }

      const result = await adminUserService.suspendUser(userId, reason.trim(), req.admin.id);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }

      return res.json({
        success: true,
        message: `User ${userId} suspended successfully`
      });
    } catch (error: any) {
      console.error('Error in suspendUser:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Unsuspend a user
   * POST /admin/users/:userId/unsuspend
   */
  async unsuspendUser(req: AdminRequest, res: Response) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      if (!req.admin) {
        return res.status(401).json({
          success: false,
          error: 'Admin authentication required'
        });
      }

      const result = await adminUserService.unsuspendUser(userId, req.admin.id);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }

      return res.json({
        success: true,
        message: `User ${userId} unsuspended successfully`
      });
    } catch (error: any) {
      console.error('Error in unsuspendUser:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Update user's LPT balance (manual adjustment)
   * PUT /admin/users/:userId/balance
   */
  async updateUserBalance(req: AdminRequest, res: Response) {
    try {
      const { userId } = req.params;
      const { balance, reason } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      if (typeof balance !== 'number' || balance < 0) {
        return res.status(400).json({
          success: false,
          error: 'Valid balance amount is required (must be >= 0)'
        });
      }

      if (!reason || reason.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Reason for balance update is required'
        });
      }

      if (!req.admin) {
        return res.status(401).json({
          success: false,
          error: 'Admin authentication required'
        });
      }

      // Only super admins can update balances
      if (req.admin.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          error: 'Super admin access required for balance updates'
        });
      }

      const result = await adminUserService.updateUserBalance(
        userId,
        balance,
        req.admin.id,
        reason.trim()
      );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }

      return res.json({
        success: true,
        data: result.data,
        message: `User balance updated successfully`
      });
    } catch (error: any) {
      console.error('Error in updateUserBalance:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get user statistics
   * GET /admin/users/stats
   */
  async getUserStats(req: AdminRequest, res: Response) {
    try {
      const result = await adminUserService.getUserStats();

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }

      return res.json({
        success: true,
        data: result.data,
        message: 'User statistics retrieved successfully'
      });
    } catch (error: any) {
      console.error('Error in getUserStats:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

export const adminUserController = new AdminUserController();
