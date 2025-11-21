import { createPublicClient, http, parseUnits, erc20Abi } from 'viem';
import { arbitrumOne, LIVEPEER_CONTRACTS } from '../protocols/config/livepeer.config';
import { privyService } from '../integrations/privy/privy.service';
import { transactionService } from './transaction.service';
import { supabase } from '../config/supabase';


export class WalletService {

  /**
   * Get the balance of ETH or LPT for a wallet
   */
  async getTokenBalance(walletAddress: `0x${string}`, token: 'ETH' | 'LPT'): Promise<string> {
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }

    const client = createPublicClient({
      chain: arbitrumOne,
      transport: http(),
    });

    if (token === 'ETH') {
      const balance = await client.getBalance({ address: walletAddress });
      return balance.toString();
    } else if (token === 'LPT') {
      const lptContractAddress = LIVEPEER_CONTRACTS.arbitrum.token as `0x${string}`;
      if (!lptContractAddress) {
        throw new Error('LPT contract address is not defined in the configuration');
      }
      const balance = await client.readContract({
        address: lptContractAddress,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [walletAddress],
      });
      return balance.toString();
    } else {
      throw new Error('Unsupported token type');
    }
  }

  /**
   * Send LPT tokens from a Privy-managed wallet to a recipient address using Privy gas sponsor
   */
  async sendLPT(params: {
    walletId: string;
    walletAddress: `0x${string}`;
    to: `0x${string}`;
    amount: string; // decimal LPT amount (e.g. "1.5")
    authorizationToken: string; // bearer token
  }): Promise<{ success: boolean; txHash?: string; error?: string }> {
    const { walletId, walletAddress, to, amount, authorizationToken } = params;

    try {
      if (!walletId || !walletAddress || !to || !amount || !authorizationToken) {
        return { success: false, error: 'Missing required parameters' };
      }

      // convert amount to wei-like units (18 decimals)
      const amountWei = parseUnits(amount, 18);

      const tokenAddress = LIVEPEER_CONTRACTS.arbitrum.token as `0x${string}`;
      if (!tokenAddress) return { success: false, error: 'LPT token address not configured' };

      // const approveResult = await this.approveLPT({ walletId, walletAddress, spender: to, amount, authorizationToken });
      // if (!approveResult.success) {
      //   return { success: false, error: `Approve failed: ${approveResult.error}` };
      // }

      // Call ERC20.transfer(to, amountWei)
      const txHash = await privyService.sendTransactionWithPrivyWalletGasSponsor(
        walletId,
        walletAddress,
        tokenAddress,
        erc20Abi,
        'transfer',
        [to, amountWei],
        authorizationToken
      );

      // Create a transaction record (best-effort). Try to resolve user_id from users table by wallet_id
      try {
        let userId = walletId;
        if (supabase) {
          const { data: user, error: userError } = await supabase
            .from('users')
            .select('user_id, email')
            .eq('wallet_id', walletId)
            .maybeSingle();

          if (userError) {
            console.error('Error fetching user for transaction creation:', userError);
          } else if (user && (user as any).user_id) {
            userId = (user as any).user_id;
          }
        }

        await transactionService.createTransaction({
          user_id: userId,
          transaction_hash: txHash,
          transaction_type: 'withdrawal',
          amount: amount,
          token_address: tokenAddress,
          token_symbol: 'LPT',
          wallet_address: walletAddress,
          wallet_id: walletId,
          status: 'confirmed',
          source: 'api',
        });
      } catch (e) {
        console.warn('Failed to create transaction record for sendLPT:', e);
      }

      return { success: true, txHash };
    } catch (error: any) {
      console.error('Error sending LPT:', error);
      return { success: false, error: error.message || String(error) };
    }
  }

  /**
   * Approve a spender (e.g., bonding manager proxy) to spend LPT on behalf of the Privy-managed wallet
   */
  async approveLPT(params: {
    walletId: string;
    walletAddress: `0x${string}`;
    spender: `0x${string}`; // contract address to approve
    amount: string; // decimal LPT amount (e.g. "1000" or use max)
    authorizationToken: string;
  }): Promise<{ success: boolean; txHash?: string; error?: string }> {
    const { walletId, walletAddress, spender, amount, authorizationToken } = params;

    try {
      if (!walletId || !walletAddress || !spender || !amount || !authorizationToken) {
        return { success: false, error: 'Missing required parameters' };
      }

      const amountWei = parseUnits(amount, 18);
      const tokenAddress = LIVEPEER_CONTRACTS.arbitrum.token as `0x${string}`;
      if (!tokenAddress) return { success: false, error: 'LPT token address not configured' };

      // Call ERC20.approve(spender, amountWei)
      const txHash = await privyService.sendTransactionWithPrivyWalletGasSponsor(
        walletId,
        walletAddress,
        tokenAddress,
        erc20Abi,
        'approve',
        [spender, amountWei],
        authorizationToken
      );
          // Create a transaction record (best-effort). Try to resolve user_id from users table by wallet_id
      try {
        let userId = walletId;
        if (supabase) {
          const { data: user, error: userError } = await supabase
            .from('users')
            .select('user_id, email')
            .eq('wallet_id', walletId)
            .maybeSingle();

          if (userError) {
            console.error('Error fetching user for transaction creation:', userError);
          } else if (user && (user as any).user_id) {
            userId = (user as any).user_id;
          }
        }

        await transactionService.createTransaction({
          user_id: userId,
          transaction_hash: txHash,
          transaction_type: 'approval',
          amount: amount,
          token_address: tokenAddress,
          token_symbol: 'LPT',
          wallet_address: walletAddress,
          wallet_id: walletId,
          status: 'confirmed',
          source: 'api',
        });
      } catch (e) {
        console.warn('Failed to create transaction record for sendLPT:', e);
      }


      return { success: true, txHash };
    } catch (error: any) {
      console.error('Error approving LPT:', error);
      return { success: false, error: error.message || String(error) };
    }
  }
}

export const walletService = new WalletService();
