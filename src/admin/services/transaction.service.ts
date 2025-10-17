import { supabase } from '../../config/supabase';

export interface AdminTransaction {
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

export interface TransactionFilters {
  userId?: string;
  status?: 'pending' | 'confirmed' | 'failed' | 'all';
  type?: 'deposit' | 'withdrawal' | 'delegation' | 'undelegation' | 'all';
  source?: 'privy_webhook' | 'manual' | 'api' | 'delegation_api' | 'all';
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string; // search by hash, wallet address, or user_id
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'amount' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export class AdminTransactionService {
  /**
   * Get all transactions with filters and pagination
   */
  async getAllTransactions(filters: TransactionFilters = {}): Promise<{
    success: boolean;
    data?: {
      transactions: (AdminTransaction & { user?: any })[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      summary: {
        totalVolume: number;
        pendingCount: number;
        confirmedCount: number;
        failedCount: number;
      };
    };
    error?: string;
  }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database connection not available' };
      }

      const page = filters.page || 1;
      const limit = Math.min(filters.limit || 50, 100); // Max 100 per page
      const offset = (page - 1) * limit;
      const sortBy = filters.sortBy || 'created_at';
      const sortOrder = filters.sortOrder || 'desc';

      let query = supabase
        .from('transactions')
        .select(`
          *,
          users (
            user_id,
            privy_user_id,
            wallet_address
          )
        `, { count: 'exact' });

      // Apply filters
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.type && filters.type !== 'all') {
        query = query.eq('transaction_type', filters.type);
      }

      if (filters.source && filters.source !== 'all') {
        query = query.eq('source', filters.source);
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      if (filters.minAmount) {
        query = query.gte('amount', filters.minAmount.toString());
      }

      if (filters.maxAmount) {
        query = query.lte('amount', filters.maxAmount.toString());
      }

      if (filters.search) {
        query = query.or(`transaction_hash.ilike.%${filters.search}%,wallet_address.ilike.%${filters.search}%,user_id.ilike.%${filters.search}%`);
      }

      // Apply sorting and pagination
      const { data, error, count } = await query
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching transactions:', error);
        return { success: false, error: error.message };
      }

      // Calculate summary statistics
      const summary = {
        totalVolume: data?.reduce((sum, tx) => sum + parseFloat(tx.amount || '0'), 0) || 0,
        pendingCount: data?.filter(tx => tx.status === 'pending').length || 0,
        confirmedCount: data?.filter(tx => tx.status === 'confirmed').length || 0,
        failedCount: data?.filter(tx => tx.status === 'failed').length || 0
      };

      return {
        success: true,
        data: {
          transactions: data || [],
          total: count || 0,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit),
          summary
        }
      };
    } catch (error: any) {
      console.error('Error in getAllTransactions:', error);
      return { success: false, error: 'Failed to fetch transactions' };
    }
  }

  /**
   * Get transaction by ID with full details
   */
  async getTransactionById(transactionId: string): Promise<{
    success: boolean;
    data?: AdminTransaction & {
      user?: any;
      relatedTransactions?: AdminTransaction[];
    };
    error?: string;
  }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database connection not available' };
      }

      // Get transaction with user details
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .select(`
          *,
          users (
            user_id,
            privy_user_id,
            wallet_address,
            lpt_balance
          )
        `)
        .eq('id', transactionId)
        .single();

      if (txError) {
        console.error('Error fetching transaction:', txError);
        return { success: false, error: txError.message };
      }

      if (!transaction) {
        return { success: false, error: 'Transaction not found' };
      }

      // Get related transactions (same user, recent)
      const { data: relatedTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', transaction.user_id)
        .neq('id', transactionId)
        .order('created_at', { ascending: false })
        .limit(10);

      return {
        success: true,
        data: {
          ...transaction,
          relatedTransactions: relatedTransactions || []
        }
      };
    } catch (error: any) {
      console.error('Error in getTransactionById:', error);
      return { success: false, error: 'Failed to fetch transaction details' };
    }
  }

  /**
   * Update transaction status (admin action)
   */
  async updateTransactionStatus(
    transactionId: string,
    status: 'pending' | 'confirmed' | 'failed',
    adminId: string,
    notes?: string
  ): Promise<{
    success: boolean;
    data?: AdminTransaction;
    error?: string;
  }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database connection not available' };
      }

      const { data, error } = await supabase
        .from('transactions')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId)
        .select()
        .single();

      if (error) {
        console.error('Error updating transaction status:', error);
        return { success: false, error: error.message };
      }

      // TODO: Log admin action for audit trail
      console.log(`Transaction ${transactionId} status updated to ${status} by admin ${adminId}. Notes: ${notes || 'None'}`);

      return { success: true, data };
    } catch (error: any) {
      console.error('Error in updateTransactionStatus:', error);
      return { success: false, error: 'Failed to update transaction status' };
    }
  }

  /**
   * Get transaction statistics
   */
  async getTransactionStats(dateFrom?: string, dateTo?: string): Promise<{
    success: boolean;
    data?: {
      total: number;
      pending: number;
      confirmed: number;
      failed: number;
      totalVolume: number;
      averageAmount: number;
      byType: {
        deposit: number;
        withdrawal: number;
        delegation: number;
        undelegation: number;
      };
      bySource: {
        privy_webhook: number;
        manual: number;
        api: number;
        delegation_api: number;
      };
      dailyVolume: Array<{
        date: string;
        volume: number;
        count: number;
      }>;
    };
    error?: string;
  }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database connection not available' };
      }

      let query = supabase.from('transactions').select('*');

      if (dateFrom) {
        query = query.gte('created_at', dateFrom);
      }

      if (dateTo) {
        query = query.lte('created_at', dateTo);
      }

      const { data: transactions, error } = await query;

      if (error) {
        console.error('Error fetching transaction stats:', error);
        return { success: false, error: error.message };
      }

      if (!transactions) {
        return { success: false, error: 'No transactions found' };
      }

      // Calculate statistics
      const total = transactions.length;
      const pending = transactions.filter(tx => tx.status === 'pending').length;
      const confirmed = transactions.filter(tx => tx.status === 'confirmed').length;
      const failed = transactions.filter(tx => tx.status === 'failed').length;

      const totalVolume = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount || '0'), 0);
      const averageAmount = total > 0 ? totalVolume / total : 0;

      const byType = {
        deposit: transactions.filter(tx => tx.transaction_type === 'deposit').length,
        withdrawal: transactions.filter(tx => tx.transaction_type === 'withdrawal').length,
        delegation: transactions.filter(tx => tx.transaction_type === 'delegation').length,
        undelegation: transactions.filter(tx => tx.transaction_type === 'undelegation').length
      };

      const bySource = {
        privy_webhook: transactions.filter(tx => tx.source === 'privy_webhook').length,
        manual: transactions.filter(tx => tx.source === 'manual').length,
        api: transactions.filter(tx => tx.source === 'api').length,
        delegation_api: transactions.filter(tx => tx.source === 'delegation_api').length
      };

      // Calculate daily volume (last 30 days or within date range)
      const dailyVolumeMap = new Map<string, { volume: number; count: number }>();
      
      transactions.forEach(tx => {
        const date = tx.created_at.split('T')[0]; // Get date part only
        const existing = dailyVolumeMap.get(date) || { volume: 0, count: 0 };
        dailyVolumeMap.set(date, {
          volume: existing.volume + parseFloat(tx.amount || '0'),
          count: existing.count + 1
        });
      });

      const dailyVolume = Array.from(dailyVolumeMap.entries())
        .map(([date, stats]) => ({ date, ...stats }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        success: true,
        data: {
          total,
          pending,
          confirmed,
          failed,
          totalVolume,
          averageAmount,
          byType,
          bySource,
          dailyVolume
        }
      };
    } catch (error: any) {
      console.error('Error in getTransactionStats:', error);
      return { success: false, error: 'Failed to fetch transaction statistics' };
    }
  }

  /**
   * Get failed transactions that need attention
   */
  async getFailedTransactions(limit: number = 50): Promise<{
    success: boolean;
    data?: AdminTransaction[];
    error?: string;
  }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database connection not available' };
      }

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          users (
            user_id,
            privy_user_id,
            wallet_address
          )
        `)
        .eq('status', 'failed')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching failed transactions:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error('Error in getFailedTransactions:', error);
      return { success: false, error: 'Failed to fetch failed transactions' };
    }
  }

  /**
   * Get pending transactions that might need attention
   */
  async getPendingTransactions(olderThanMinutes: number = 30): Promise<{
    success: boolean;
    data?: AdminTransaction[];
    error?: string;
  }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database connection not available' };
      }

      const cutoffTime = new Date(Date.now() - olderThanMinutes * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          users (
            user_id,
            privy_user_id,
            wallet_address
          )
        `)
        .eq('status', 'pending')
        .lt('created_at', cutoffTime)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) {
        console.error('Error fetching pending transactions:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error('Error in getPendingTransactions:', error);
      return { success: false, error: 'Failed to fetch pending transactions' };
    }
  }
}

export const adminTransactionService = new AdminTransactionService();
