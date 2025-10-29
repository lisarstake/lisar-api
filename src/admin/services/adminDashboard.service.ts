import { supabase } from '../../config/supabase';
import { adminTransactionService } from './transaction.service';
import { privyService } from '../../integrations/privy/privy.service';

export class AdminDashboardService {
  async getSummary(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      if (!supabase) return { success: false, error: 'Database connection not available' };

      // Total delegators (users with positive LPT balance)
      const { count: totalDelegators } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gt('lpt_balance', 0);

      // Total LPT delegated (sum of confirmed delegation transactions)
      const { data: delegatedRows } = await supabase
        .from('transactions')
        .select('amount')
        .eq('transaction_type', 'delegation')
        .eq('status', 'confirmed');

      const totalLptDelegated = delegatedRows?.reduce((sum: number, r: any) => sum + parseFloat(r.amount || '0'), 0) || 0;

      // Total NGN converted — best-effort: sum of transactions with source onramp (if available)
      const { data: onrampRows } = await supabase
        .from('transactions')
        .select('amount, metadata')
        .eq('source', 'onramp')
        .eq('status', 'confirmed');

      // If your onramp stores fiat amounts in metadata, extract it; otherwise return null
      let totalNgnConverted = 0;
      if (onrampRows && onrampRows.length) {
        for (const r of onrampRows) {
          // try to read metadata.fiat_amount or metadata.ngn
          const meta = r.metadata || {};
          const fiat = meta?.fiat_amount || meta?.ngn_amount || meta?.ngn || null;
          if (fiat) totalNgnConverted += parseFloat(fiat as any) || 0;
        }
      }

      // Total rewards distributed (approx NGN) — placeholder: sum of transactions marked as rewards
      const { data: rewardsRows } = await supabase
        .from('transactions')
        .select('amount, metadata')
        .eq('transaction_type', 'reward')
        .eq('status', 'confirmed');

      let totalRewardsNgn = 0;
      if (rewardsRows && rewardsRows.length) {
        for (const r of rewardsRows) {
          const meta = r.metadata || {};
          const fiat = meta?.fiat_amount || meta?.ngn_amount || meta?.ngn || null;
          if (fiat) totalRewardsNgn += parseFloat(fiat as any) || 0;
        }
      }

      return {
        success: true,
        data: {
          totalDelegators: totalDelegators || 0,
          totalNgNConverted: totalNgnConverted || 0,
          totalLptDelegated,
          totalRewardsDistributedNgn: totalRewardsNgn || 0,
          lastUpdated: new Date().toISOString()
        }
      };
    } catch (error: any) {
      console.error('Error in AdminDashboardService.getSummary:', error);
      return { success: false, error: 'Failed to fetch dashboard summary' };
    }
  }

  async getRecentTransactions(limit = 10): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      if (!supabase) return { success: false, error: 'Database connection not available' };

      const { data, error } = await supabase
        .from('transactions')
        .select(`*, users (user_id, privy_user_id, wallet_address)`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent transactions:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error('Error in AdminDashboardService.getRecentTransactions:', error);
      return { success: false, error: 'Failed to fetch recent transactions' };
    }
  }

  async getHealthStatus(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const supabaseStatus = supabase ? 'connected' : 'not configured';

      // Privy health via service testConnection if available
      let privyStatus: 'ok' | 'down' | 'degraded' = 'down';
      try {
        const p = await privyService.testConnection();
        privyStatus = p.connected ? 'ok' : 'down';
      } catch (e) {
        privyStatus = 'down';
      }

      // Subgraph health - ping the configured subgraph URL if present
      let subgraphStatus: 'ok' | 'down' | 'degraded' = 'down';
      const url = process.env.LIVEPEER_SUBGRAPH_URL;
      if (url) {
        try {
          const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: '{ _meta { block { number } } }' }) });
          subgraphStatus = res.ok ? 'ok' : 'down';
        } catch (e) {
          subgraphStatus = 'down';
        }
      } else {
        subgraphStatus = 'not configured' as any;
      }

      return {
        success: true,
        data: {
          onramp: 'unknown',
          privy: privyStatus,
          subgraph: subgraphStatus,
          supabase: supabaseStatus
        }
      };
    } catch (error: any) {
      console.error('Error in AdminDashboardService.getHealthStatus:', error);
      return { success: false, error: 'Failed to fetch health status' };
    }
  }
}

export const adminDashboardService = new AdminDashboardService();
