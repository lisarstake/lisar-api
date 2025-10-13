import { createPublicClient, http, parseUnits, erc20Abi } from 'viem';
import { arbitrumOne, LIVEPEER_CONTRACTS } from '../protocols/config/livepeer.config';


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
}

export const walletService = new WalletService();
