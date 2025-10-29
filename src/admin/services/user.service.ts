import { supabase } from '../../config/supabase';

export interface AdminUser {
  user_id: string;
  privy_user_id: string;
  wallet_address?: string;
  wallet_id?: string;
  lpt_balance?: number;
  is_suspended?: boolean;
  suspension_reason?: string;
  suspended_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface UserFilters {
  search?: string;
  status?: 'active' | 'suspended' | 'all';
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'lpt_balance' | 'user_id';
  sortOrder?: 'asc' | 'desc';
}

export class AdminUserService {
  /**
   * Get all users with filters and pagination
   */
  async getAllUsers(filters: UserFilters = {}): Promise<{
    success: boolean;
    data?: {
      users: AdminUser[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
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
        .from('users')
        .select('*', { count: 'exact' });

      // Apply search filter
      if (filters.search) {
        const search = String(filters.search).trim();
        const uuidRegex = /^[0-9a-fA-F\-]{36}$/;
        const isUuid = uuidRegex.test(search);

        if (isUuid) {
          // If the search looks like a UUID, use exact equality on uuid columns and ilike on wallet_address
          query = query.or(`privy_user_id.eq.${search},user_id.eq.${search},wallet_address.ilike.%${search}%`);
        } else {
          // Otherwise search text columns only (avoid ilike on uuid columns which Postgres rejects)
          query = query.or(`wallet_address.ilike.%${search}%,wallet_id.ilike.%${search}%,privy_user_id.eq.${search}`);
        }
      }

      // Apply status filter
      if (filters.status === 'active') {
        query = query.eq('is_suspended', false);
      } else if (filters.status === 'suspended') {
        query = query.eq('is_suspended', true);
      }

      // Apply sorting and pagination
      const { data, error, count } = await query
        .order(sortBy === 'created_at' ? 'created_date' : sortBy, { ascending: sortOrder === 'asc' })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching users:', error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: {
          users: data || [],
          total: count || 0,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit)
        }
      };
    } catch (error: any) {
      console.error('Error in getAllUsers:', error);
      return { success: false, error: 'Failed to fetch users' };
    }
  }

  /**
   * Get user by ID with transaction history
   */
  async getUserById(userId: string): Promise<{
    success: boolean;
    data?: AdminUser & {
      transactions: any[];
      transactionStats: {
        totalTransactions: number;
        totalVolume: number;
        pendingTransactions: number;
      };
    };
    error?: string;
  }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database connection not available' };
      }

      const uid = userId?.trim();

      // Get user details
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', uid)
        .maybeSingle();

      if (userError) {
        console.error('Error fetching user:', userError);
        return { success: false, error: userError.message };
      }

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Get user transactions
      const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(100);

      if (txError) {
        console.error('Error fetching user transactions:', txError);
        return { success: false, error: txError.message };
      }

      // Calculate transaction stats
      const transactionStats = {
        totalTransactions: transactions?.length || 0,
        totalVolume: transactions?.reduce((sum, tx) => sum + parseFloat(tx.amount || '0'), 0) || 0,
        pendingTransactions: transactions?.filter(tx => tx.status === 'pending').length || 0
      };

      return {
        success: true,
        data: {
          ...user,
          transactions: transactions || [],
          transactionStats
        }
      };
    } catch (error: any) {
      console.error('Error in getUserById:', error);
      return { success: false, error: 'Failed to fetch user details' };
    }
  }

  /**
   * Suspend a user
   */
  async suspendUser(userId: string, reason: string, adminId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database connection not available' };
      }

      const uid = userId?.trim();

      const { error } = await supabase
        .from('users')
        .update({
          is_suspended: true,
          suspension_reason: reason,
          suspended_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', uid);

      if (error) {
        console.error('Error suspending user:', error);
        return { success: false, error: error.message };
      }

      // TODO: Log admin action for audit trail
      console.log(`User ${userId} suspended by admin ${adminId}. Reason: ${reason}`);

      return { success: true };
    } catch (error: any) {
      console.error('Error in suspendUser:', error);
      return { success: false, error: 'Failed to suspend user' };
    }
  }

  /**
   * Unsuspend a user
   */
  async unsuspendUser(userId: string, adminId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database connection not available' };
      }

      const uid = userId?.trim();

      const { error } = await supabase
        .from('users')
        .update({
          is_suspended: false,
          suspension_reason: null,
          suspended_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', uid);

      if (error) {
        console.error('Error unsuspending user:', error);
        return { success: false, error: error.message };
      }

      // TODO: Log admin action for audit trail
      console.log(`User ${userId} unsuspended by admin ${adminId}`);

      return { success: true };
    } catch (error: any) {
      console.error('Error in unsuspendUser:', error);
      return { success: false, error: 'Failed to unsuspend user' };
    }
  }

  /**
   * Update user's LPT balance (manual adjustment)
   */
  async updateUserBalance(userId: string, newBalance: number, adminId: string, reason: string): Promise<{
    success: boolean;
    data?: { previousBalance: number; newBalance: number };
    error?: string;
  }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database connection not available' };
      }

      const uid = userId?.trim();

      // Get current balance first
      const { data: user, error: getUserError } = await supabase
        .from('users')
        .select('lpt_balance')
        .eq('user_id', uid)
        .maybeSingle();

      if (getUserError) {
        console.error('Error fetching user balance:', getUserError);
        return { success: false, error: getUserError.message };
      }

      const previousBalance = user?.lpt_balance || 0;

      // Update balance
      const { error } = await supabase
        .from('users')
        .update({
          lpt_balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', uid);

      if (error) {
        console.error('Error updating user balance:', error);
        return { success: false, error: error.message };
      }

      // TODO: Log admin action and create audit record
      console.log(`User ${userId} balance updated by admin ${adminId}. Previous: ${previousBalance}, New: ${newBalance}. Reason: ${reason}`);

      return {
        success: true,
        data: {
          previousBalance,
          newBalance
        }
      };
    } catch (error: any) {
      console.error('Error in updateUserBalance:', error);
      return { success: false, error: 'Failed to update user balance' };
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{
    success: boolean;
    data?: {
      totalUsers: number;
      activeUsers: number;
      suspendedUsers: number;
      totalLptBalance: number;
      newUsersToday: number;
    };
    error?: string;
  }> {
    try {
      if (!supabase) {
        return { success: false, error: 'Database connection not available' };
      }

      // Get total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Get active users
      const { count: activeUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_suspended', false);

      // Get suspended users
      const { count: suspendedUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_suspended', true);

      // Get total LPT balance
      const { data: balanceData } = await supabase
        .from('users')
        .select('lpt_balance');

      const totalLptBalance = balanceData?.reduce((sum, user) => sum + (user.lpt_balance || 0), 0) || 0;

      // Get new users today
      const today = new Date().toISOString().split('T')[0];
      const { count: newUsersToday } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lte('created_at', `${today}T23:59:59.999Z`);

      return {
        success: true,
        data: {
          totalUsers: totalUsers || 0,
          activeUsers: activeUsers || 0,
          suspendedUsers: suspendedUsers || 0,
          totalLptBalance,
          newUsersToday: newUsersToday || 0
        }
      };
    } catch (error: any) {
      console.error('Error in getUserStats:', error);
      return { success: false, error: 'Failed to fetch user statistics' };
    }
  }
}

export const adminUserService = new AdminUserService();
