import { Request, Response } from 'express';
import { transactionService } from '../services/transaction.service';

export class TransactionController {
  /**
   * Get all transactions for a user
   */
  async getUserTransactions(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;
      const { limit } = req.query;

      if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
      }

      const result = await transactionService.getUserTransactions(
        userId,
        limit ? parseInt(limit as string) : undefined
      );

      if (result.success) {
        return res.status(200).json({ 
          success: true, 
          data: result.data,
          count: result.data?.length || 0
        });
      } else {
        return res.status(500).json({ success: false, error: result.error });
      }
    } catch (error: any) {
      console.error('Error in getUserTransactions:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * Get a specific transaction by ID
   */
  async getTransactionById(req: Request, res: Response): Promise<Response> {
    try {
      const { transactionId } = req.params;

      if (!transactionId) {
        return res.status(400).json({ success: false, error: 'Transaction ID is required' });
      }

      const result = await transactionService.getTransactionById(transactionId);

      if (result.success) {
        return res.status(200).json({ success: true, data: result.data });
      } else {
        return res.status(404).json({ success: false, error: result.error });
      }
    } catch (error: any) {
      console.error('Error in getTransactionById:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * Get transaction by hash
   */
  async getTransactionByHash(req: Request, res: Response): Promise<Response> {
    try {
      const { transactionHash } = req.params;

      if (!transactionHash) {
        return res.status(400).json({ success: false, error: 'Transaction hash is required' });
      }

      const result = await transactionService.getTransactionByHash(transactionHash);

      if (result.success) {
        return res.status(200).json({ success: true, data: result.data });
      } else {
        return res.status(404).json({ success: false, error: result.error });
      }
    } catch (error: any) {
      console.error('Error in getTransactionByHash:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * Create a new transaction
   */
  async createTransaction(req: Request, res: Response): Promise<Response> {
    try {
      const transactionData = req.body;

      // Validate required fields
      if (!transactionData.user_id || !transactionData.transaction_hash || !transactionData.transaction_type) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields: user_id, transaction_hash, transaction_type' 
        });
      }

      const result = await transactionService.createTransaction(transactionData);

      if (result.success) {
        return res.status(201).json({ success: true, data: result.data });
      } else {
        return res.status(500).json({ success: false, error: result.error });
      }
    } catch (error: any) {
      console.error('Error in createTransaction:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * Update transaction status
   */
  async updateTransactionStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { transactionId } = req.params;
      const { status } = req.body;

      if (!transactionId) {
        return res.status(400).json({ success: false, error: 'Transaction ID is required' });
      }

      if (!status || !['pending', 'confirmed', 'failed'].includes(status)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Valid status is required (pending, confirmed, failed)' 
        });
      }

      const result = await transactionService.updateTransactionStatus(transactionId, status);

      if (result.success) {
        return res.status(200).json({ success: true, data: result.data });
      } else {
        return res.status(404).json({ success: false, error: result.error });
      }
    } catch (error: any) {
      console.error('Error in updateTransactionStatus:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * Get user transactions by type
   */
  async getUserTransactionsByType(req: Request, res: Response): Promise<Response> {
    try {
      const { userId, type } = req.params;

      if (!userId || !type) {
        return res.status(400).json({ 
          success: false, 
          error: 'User ID and transaction type are required' 
        });
      }

      if (!['deposit', 'withdrawal', 'delegation', 'undelegation'].includes(type)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid transaction type. Must be: deposit, withdrawal, delegation, or undelegation' 
        });
      }

      const result = await transactionService.getUserTransactionsByType(
        userId, 
        type as 'deposit' | 'withdrawal' | 'delegation' | 'undelegation'
      );

      if (result.success) {
        return res.status(200).json({ 
          success: true, 
          data: result.data,
          count: result.data?.length || 0
        });
      } else {
        return res.status(500).json({ success: false, error: result.error });
      }
    } catch (error: any) {
      console.error('Error in getUserTransactionsByType:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}

export const transactionController = new TransactionController();
