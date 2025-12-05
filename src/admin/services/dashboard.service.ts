import { supabase } from '../../config/supabase';
import { adminTransactionService } from './transaction.service';
import { privyService } from '../../integrations/privy/privy.service';

export class AdminDashboardService {
  async getSummary(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log('🔍 [Dashboard] Starting getSummary...');
      
      if (!supabase) {
        console.error('❌ [Dashboard] Supabase not available');
        return { success: false, error: 'Database connection not available' };
      }

      console.log('✅ [Dashboard] Supabase connected');

      // Total delegators: prefer fast DB count using is_staker (added by migration). Fallback to scanning users if column missing.
      let totalDelegators = 0;
      try {
        console.log('📊 [Dashboard] Fetching staker count with is_staker...');
        const { count, error: stakerCountErr } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('is_staker', true);

        if (!stakerCountErr) {
          totalDelegators = count || 0;
          console.log('✅ [Dashboard] is_staker count:', totalDelegators);
        } else {
          console.warn('⚠️ [Dashboard] is_staker error:', stakerCountErr);
          // Fallback for older schemas: count users with non-null wallet_address
          const { count: fallbackCount } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .not('wallet_address', 'is', null);
          totalDelegators = fallbackCount || 0;
          console.log('✅ [Dashboard] Fallback count (wallet_address):', totalDelegators);
        }
      } catch (err) {
        console.error('❌ [Dashboard] Error reading is_staker from DB, falling back:', err);
        const { count: fallbackCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .not('wallet_address', 'is', null);
        totalDelegators = fallbackCount || 0;
        console.log('✅ [Dashboard] Catch fallback count:', totalDelegators);
      }

      // Total LPT delegated (sum of confirmed delegation transactions)
      console.log('📊 [Dashboard] Fetching delegation transactions...');
      const { data: delegatedRows, error: delegationError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('transaction_type', 'delegation')
        .eq('status', 'confirmed');

      if (delegationError) {
        console.error('❌ [Dashboard] Delegation fetch error:', delegationError);
      } else {
        console.log('✅ [Dashboard] Found delegation transactions:', delegatedRows?.length || 0);
      }

      const totalLptDelegated = delegatedRows?.reduce((sum: number, r: any) => sum + parseFloat(r.amount || '0'), 0) || 0;
      console.log('📈 [Dashboard] Total LPT delegated:', totalLptDelegated);

      // Total NGN converted — best-effort: sum of transactions with source onramp (if available)
      console.log('📊 [Dashboard] Fetching onramp transactions...');
      const { data: onrampRows, error: onrampError } = await supabase
        .from('transactions')
        .select('amount, metadata')
        .eq('source', 'onramp')
        .eq('status', 'confirmed');

      if (onrampError) {
        console.error('❌ [Dashboard] Onramp fetch error:', onrampError);
      } else {
        console.log('✅ [Dashboard] Found onramp transactions:', onrampRows?.length || 0);
      }

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
      console.log('📈 [Dashboard] Total NGN converted:', totalNgnConverted);

      // Validators counts
      console.log('📊 [Dashboard] Fetching validators count...');
      let totalValidators = 0;
      try {
        const { count: vTotal, error: vError } = await supabase.from('validators').select('*', { count: 'exact', head: true });
        if (vError) {
          console.warn('⚠️ [Dashboard] Validators fetch error:', vError);
        } else {
          totalValidators = vTotal || 0;
          console.log('✅ [Dashboard] Total validators:', totalValidators);
        }
      } catch (e) {
        console.warn('❌ [Dashboard] Could not fetch total validators count:', e);
      }

      const summaryData = {
        totalDelegators: totalDelegators || 0,
        totalNgNConverted: totalNgnConverted || 0,
        totalLptDelegated,
        totalValidators,
        lastUpdated: new Date().toISOString()
      };

      console.log('✅ [Dashboard] Summary complete:', summaryData);

      return {
        success: true,
        data: summaryData
      };
    } catch (error: any) {
      console.error('❌ [Dashboard] Fatal error in getSummary:', error);
      console.error('Stack trace:', error.stack);
      return { success: false, error: 'Failed to fetch dashboard summary' };
    }
  }

  async getRecentTransactions(limit = 10): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      if (!supabase) return { success: false, error: 'Database connection not available' };

      // only delegation / undelegation / withdrawal / deposit transactions
      const { data, error } = await supabase
        .from('transactions')
        .select(`*, users (wallet_address)`)
        .in('transaction_type', ['delegation', 'undelegation', 'withdrawal', 'deposit'])
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent transactions:', error);
        return { success: false, error: error.message };
      }

      const mapped = (data || []).map((r: any) => {
        const address = r.users?.wallet_address || r.wallet_address || null;
        const amt = r.amount ?? (r.metadata?.amount ?? null) ?? '0';
        let event = 'unknown';
        let description = '';

        if (r.transaction_type === 'delegation') {
          event = 'bond';
          description = `bonded ${amt}`;
        } else if (r.transaction_type === 'undelegation') {
          event = 'unbond';
          description = `unbonded ${amt}`;
        } else if (r.transaction_type === 'withdrawal') {
          event = 'withdraw';
          description = `withdrawn ${amt}`;
        } else if (r.transaction_type === 'deposit') {
          event = 'deposit';
          description = `deposited ${amt}`;
        }

        const date = r.transaction_timestamp || r.created_at || null;

        return {
          address,
          event,
          description,
          date,
          transaction_hash: r.transaction_hash || null
        };
      });

      return { success: true, data: mapped };
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
