import { Response } from 'express';
import { AdminRequest } from '../middleware/admin.middleware';
import { adminTransactionService, TransactionFilters } from '../services/transaction.service';

export class AdminTransactionController {
  /**
   * Get all transactions with filters and pagination
   * GET /admin/transactions
   */
  async getTransactions(req: AdminRequest, res: Response) {
    try {
      const filters: TransactionFilters = {
        userId: req.query.userId as string,
        status: req.query.status as 'pending' | 'confirmed' | 'failed' | 'all',
        type: req.query.type as 'deposit' | 'withdrawal' | 'delegation' | 'undelegation' | 'all',
        source: req.query.source as 'privy_webhook' | 'manual' | 'api' | 'delegation_api' | 'all',
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        minAmount: req.query.minAmount ? parseFloat(req.query.minAmount as string) : undefined,
        maxAmount: req.query.maxAmount ? parseFloat(req.query.maxAmount as string) : undefined,
        search: req.query.search as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 50,
        sortBy: req.query.sortBy as 'created_at' | 'amount' | 'status',
        sortOrder: req.query.sortOrder as 'asc' | 'desc'
      };

      const result = await adminTransactionService.getAllTransactions(filters);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }

      return res.json({
        success: true,
        data: result.data,
        message: 'Transactions retrieved successfully'
      });
    } catch (error: any) {
      console.error('Error in getTransactions:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get transaction details by ID
   * GET /admin/transactions/:transactionId
   */
  async getTransactionDetails(req: AdminRequest, res: Response) {
    try {
      const { transactionId } = req.params;

      if (!transactionId) {
        return res.status(400).json({
          success: false,
          error: 'Transaction ID is required'
        });
      }

      const result = await adminTransactionService.getTransactionById(transactionId);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          error: result.error
        });
      }

      return res.json({
        success: true,
        data: result.data,
        message: 'Transaction details retrieved successfully'
      });
    } catch (error: any) {
      console.error('Error in getTransactionDetails:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Update transaction status
   * PATCH /admin/transactions/:transactionId/status
   */
  async updateTransactionStatus(req: AdminRequest, res: Response) {
    try {
      const { transactionId } = req.params;
      const { status, notes } = req.body;

      if (!transactionId) {
        return res.status(400).json({
          success: false,
          error: 'Transaction ID is required'
        });
      }

      if (!status || !['pending', 'confirmed', 'failed'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Valid status is required (pending, confirmed, or failed)'
        });
      }

      if (!req.admin) {
        return res.status(401).json({
          success: false,
          error: 'Admin authentication required'
        });
      }

      const result = await adminTransactionService.updateTransactionStatus(
        transactionId,
        status,
        req.admin.id,
        notes
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
        message: `Transaction status updated to ${status}`
      });
    } catch (error: any) {
      console.error('Error in updateTransactionStatus:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get transaction statistics
   * GET /admin/transactions/stats
   */
  async getTransactionStats(req: AdminRequest, res: Response) {
    try {
      const dateFrom = req.query.dateFrom as string;
      const dateTo = req.query.dateTo as string;

      const result = await adminTransactionService.getTransactionStats(dateFrom, dateTo);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }

      return res.json({
        success: true,
        data: result.data,
        message: 'Transaction statistics retrieved successfully'
      });
    } catch (error: any) {
      console.error('Error in getTransactionStats:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get failed transactions
   * GET /admin/transactions/failed
   */
  async getFailedTransactions(req: AdminRequest, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await adminTransactionService.getFailedTransactions(limit);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }

      return res.json({
        success: true,
        data: result.data,
        message: 'Failed transactions retrieved successfully'
      });
    } catch (error: any) {
      console.error('Error in getFailedTransactions:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get pending transactions that need attention
   * GET /admin/transactions/pending
   */
  async getPendingTransactions(req: AdminRequest, res: Response) {
    try {
      const olderThanMinutes = parseInt(req.query.olderThanMinutes as string) || 30;

      const result = await adminTransactionService.getPendingTransactions(olderThanMinutes);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }

      return res.json({
        success: true,
        data: result.data,
        message: 'Pending transactions retrieved successfully'
      });
    } catch (error: any) {
      console.error('Error in getPendingTransactions:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get transactions for a specific user
   * GET /admin/users/:userId/transactions
   */
  async getUserTransactions(req: AdminRequest, res: Response) {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const status = req.query.status as 'pending' | 'confirmed' | 'failed' | 'all';
      const type = req.query.type as 'deposit' | 'withdrawal' | 'delegation' | 'undelegation' | 'all';

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      const filters: TransactionFilters = {
        userId,
        status,
        type,
        page,
        limit,
        sortBy: 'created_at',
        sortOrder: 'desc'
      };

      const result = await adminTransactionService.getAllTransactions(filters);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }

      return res.json({
        success: true,
        data: result.data,
        message: `Transactions for user ${userId} retrieved successfully`
      });
    } catch (error: any) {
      console.error('Error in getUserTransactions:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

export const adminTransactionController = new AdminTransactionController();
