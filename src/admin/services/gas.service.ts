import { supabase } from '../../config/supabase';
import { arbitrumOne } from '../../protocols/config/livepeer.config';
import { ethers } from 'ethers';

type TopUpResult = {
  user_id?: string | null;
  wallet_id?: string | null;
  wallet_address?: string | null;
  balanceWei?: string | null;
  neededWei?: string | null;
  topUpPerformed: boolean;
  txHash?: string | null;
  error?: string | null;
};

export class GasService {
  private provider: ethers.JsonRpcProvider;
  private signer?: ethers.Wallet;

  constructor() {
    const rpc =  arbitrumOne.rpcUrls?.default?.http?.[0]
    this.provider = new ethers.JsonRpcProvider(rpc);

    const pk = process.env.GAS_TOPUP_PRIVATE_KEY;
    if (pk) {
      try {
        this.signer = new ethers.Wallet(pk, this.provider);
      } catch (err) {
        console.error('Failed to initialize gas-topup signer:', err);
      }
    } else {
      console.warn('GAS_TOPUP_PRIVATE_KEY not set — gas top-up will be disabled');
    }
  }

  /**
   * Top up gas for all users with a wallet_address whose balance is less than `amount` (ETH string).
   */
  async topUpAll(amount: string): Promise<{ success: boolean; details: TopUpResult[]; error?: string | null }> {
    try {
      if (!amount) return { success: false, details: [], error: 'Amount required' };

      const amountWei = ethers.parseEther(String(amount));

      if (!this.signer) return { success: false, details: [], error: 'Server hot wallet not configured (GAS_TOPUP_PRIVATE_KEY)' };

      if (!supabase) return { success: false, details: [], error: 'Supabase client not initialized' };

      // Pagination and concurrency settings (environment overrides)
      const pageSize = parseInt(process.env.GAS_TOPUP_PAGE_SIZE || '500', 10);
      const concurrency = parseInt(process.env.GAS_TOPUP_CONCURRENCY || '20', 10);
      const maxToProcess = parseInt(process.env.GAS_TOPUP_MAX || '0', 10) || 0; // 0 = no limit

      const details: TopUpResult[] = [];

      // Simple concurrency runner without external deps
      const runConcurrent = async <T>(tasks: Array<() => Promise<T>>, parallel: number) => {
        const results: T[] = new Array(tasks.length);
        let i = 0;
        const workers = new Array(Math.max(1, parallel)).fill(0).map(async () => {
          while (true) {
            const idx = i++;
            if (idx >= tasks.length) break;
            try {
              results[idx] = await tasks[idx]();
            } catch (err) {
              // store the error object so caller can handle
              // @ts-ignore
              results[idx] = err;
            }
          }
        });
        await Promise.all(workers);
        return results;
      };

      let offset = 0;
      let processed = 0;
      while (true) {
        const to = offset + pageSize - 1;
        // Supabase range is inclusive: .range(from, to)
        const { data: usersPage, error: pageErr } = await supabase
          .from('users')
          .select('user_id,wallet_id,wallet_address')
          .not('wallet_address', 'is', null)
          .order('user_id', { ascending: true })
          .range(offset, to);

        if (pageErr) {
          console.error('Error fetching users page for gas topup:', pageErr);
          return { success: false, details: [], error: pageErr.message || 'Failed to fetch users page' };
        }

        const usersList = (usersPage as any[]) || [];
        if (usersList.length === 0) break;

        // Build tasks for this page
        const tasks: Array<() => Promise<TopUpResult>> = usersList.map((u) => {
          return async () => {
            const addr = u?.wallet_address;
            const row: TopUpResult = {
              user_id: u?.user_id || null,
              wallet_id: u?.wallet_id || null,
              wallet_address: addr || null,
              balanceWei: null,
              neededWei: amountWei.toString(),
              topUpPerformed: false,
              txHash: null,
              error: null
            };

            if (!addr) {
              row.error = 'missing wallet address';
              return row;
            }

            try {
              const balance = await this.provider.getBalance(addr);
              row.balanceWei = balance.toString();
              if (balance < amountWei) {
                const tx = await this.signer!.sendTransaction({ to: addr, value: amountWei });
                try { await tx.wait(1); } catch (e) { /* ignore wait errors */ }
                row.topUpPerformed = true;
                row.txHash = tx.hash;
              }
            } catch (err: any) {
              console.error('Error topping up address', addr, err?.message || err);
              row.error = err?.message || String(err);
            }

            return row;
          };
        });

        const pageResults = await runConcurrent(tasks, concurrency);
        for (const r of pageResults) {
          details.push(r as TopUpResult);
          processed += 1;
          if (maxToProcess > 0 && processed >= maxToProcess) break;
        }

        if (maxToProcess > 0 && processed >= maxToProcess) break;
        offset += pageSize;
      }

      return { success: true, details };
    } catch (err: any) {
      console.error('GasService.topUpAll error:', err);
      return { success: false, details: [], error: err?.message || 'Unknown error' };
    }
  }
}

export const gasService = new GasService();
