import { supabase } from '../config/supabase';
import { randomUUID } from 'crypto';

export interface Transaction {
  id: string;
  user_id: string;
  transaction_hash: string;
  transaction_type: 'deposit' | 'withdrawal' | 'delegation' | 'undelegation';
  amount: string;
  token_address?: string;
  token_symbol?: string;
  wallet_address?: string;
  wallet_id?: string;
  status: 'pending' | 'confirmed' | 'failed';
  source: 'privy_webhook' | 'manual' | 'api' | 'delegation_api';
  svix_id?: string;
  created_at: string;
}

export class TransactionService {
  /**
   * Create a new transaction record
   */
  async createTransaction(transactionData: Omit<Transaction, 'id' | 'created_at'>): Promise<{
    success: boolean;
    data?: Transaction;
    error?: string;
  }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Supabase client not initialized' };
      }

      const transactionId = randomUUID();
      const transaction: Transaction = {
        id: transactionId,
        ...transactionData,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert(transaction)
        .select()
        .single();

      if (error) {
        console.error('Error creating transaction:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error in createTransaction:', error);
      return { success: false, error: 'Failed to create transaction' };
    }
  }

  /**
   * Get all transactions for a user
   */
  async getUserTransactions(userId: string, limit?: number): Promise<{
    success: boolean;
    data?: Transaction[];
    error?: string;
  }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Supabase client not initialized' };
      }

      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching user transactions:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error('Error in getUserTransactions:', error);
      return { success: false, error: 'Failed to fetch transactions' };
    }
  }

  /**
   * Get a specific transaction by ID
   */
  async getTransactionById(transactionId: string): Promise<{
    success: boolean;
    data?: Transaction;
    error?: string;
  }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Supabase client not initialized' };
      }

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (error) {
        console.error('Error fetching transaction:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error in getTransactionById:', error);
      return { success: false, error: 'Failed to fetch transaction' };
    }
  }

  /**
   * Get transactions by transaction hash
   */
  async getTransactionByHash(transactionHash: string): Promise<{
    success: boolean;
    data?: Transaction;
    error?: string;
  }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Supabase client not initialized' };
      }

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('transaction_hash', transactionHash)
        .single();

      if (error) {
        console.error('Error fetching transaction by hash:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error in getTransactionByHash:', error);
      return { success: false, error: 'Failed to fetch transaction' };
    }
  }

  /**
   * Update transaction status
   */
  async updateTransactionStatus(
    transactionId: string,
    status: 'pending' | 'confirmed' | 'failed'
  ): Promise<{
    success: boolean;
    data?: Transaction;
    error?: string;
  }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Supabase client not initialized' };
      }

      const { data, error } = await supabase
        .from('transactions')
        .update({ status })
        .eq('id', transactionId)
        .select()
        .single();

      if (error) {
        console.error('Error updating transaction status:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error in updateTransactionStatus:', error);
      return { success: false, error: 'Failed to update transaction status' };
    }
  }

  /**
   * Get transactions by type for a user
   */
  async getUserTransactionsByType(
    userId: string,
    transactionType: 'deposit' | 'withdrawal' | 'delegation' | 'undelegation'
  ): Promise<{
    success: boolean;
    data?: Transaction[];
    error?: string;
  }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Supabase client not initialized' };
      }

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('transaction_type', transactionType)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching transactions by type:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error('Error in getUserTransactionsByType:', error);
      return { success: false, error: 'Failed to fetch transactions' };
    }
  }
}

export const transactionService = new TransactionService();
