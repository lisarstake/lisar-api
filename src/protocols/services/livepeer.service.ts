import { privyService } from '../../integrations/privy/privy.service';
import { arbitrumOne, LIVEPEER_CONTRACTS } from '../config/livepeer.config';
import bondingManagerAbi from '../abis/livepeer/bondingManager.abi.json';
import LPT_TOKEN_ABI from '../abis/livepeer/lptToken.abi.json';
import { ethers } from 'ethers';
import { type Hex} from 'viem';
export class LivepeerService {
  /**
   * Delegate tokens to a Livepeer orchestrator using a Privy wallet
   */
  async delegateToLivepeer(
    walletId: string,
    walletAddress: Hex,
    orchestratorAddress: Hex,
    amount: string,
    authorizationToken: string // Added optional authorization context
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      const amountWei = ethers.parseEther(amount);

      if (!authorizationToken) {
        throw new Error('Authorization context or private key is missing');
      }

      const userJwt = authorizationToken;

      // Step 1: Approve the Livepeer Bonding Manager contract to spend tokens
      const approveTxHash = await privyService.sendTransactionWithPrivyWalletGasSponsor(
        walletId,
        walletAddress,
        LIVEPEER_CONTRACTS.arbitrum.token as Hex,
        LPT_TOKEN_ABI,
        'approve',
        [LIVEPEER_CONTRACTS.arbitrum.proxy as Hex, amountWei],
        userJwt // Pass userJwt
      );

      console.log('Approve transaction hash:', approveTxHash);

      // Step 2: Bond tokens to the orchestrator
      const bondTxHash = await privyService.sendTransactionWithPrivyWalletGasSponsor(
        walletId,
        walletAddress,
        LIVEPEER_CONTRACTS.arbitrum.proxy as Hex,
        bondingManagerAbi,
        'bond',
        [amountWei, orchestratorAddress],
        userJwt // Pass userJwt
      );

      console.log('Bond transaction hash:', bondTxHash);

      return { success: true, txHash: bondTxHash };
  
    } catch (error: any) {
      console.error('Error delegating to Livepeer:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }

  /**
   * Unbond tokens from a Livepeer orchestrator using a Privy wallet
   */
  async undelegate(
    walletId: string,
    walletAddress: Hex,
    amount: string,
    authorizationToken: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      const amountWei = ethers.parseEther(amount);

      if (!authorizationToken) {
        throw new Error('Authorization context or private key is missing');
      }

      const userJwt = authorizationToken;

      // Unbond tokens
      const unbondTxHash = await privyService.writeToContractWithPrivyWallet(
        walletId,
        walletAddress,
        LIVEPEER_CONTRACTS.arbitrum.proxy as Hex,
        bondingManagerAbi,
        'unbond',
        [amountWei],
        userJwt // Pass userJwt
      );

      console.log('Unbond transaction hash:', unbondTxHash);

      return { success: true, txHash: unbondTxHash };
    } catch (error: any) {
      console.error('Error unbonding tokens:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }

  /**
   * Withdraw unbonded stake from Livepeer using a Privy wallet
   */
  async withdrawStake(
    walletId: string,
    walletAddress: Hex,
    unbondingLockId: number,
    authorizationToken: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!authorizationToken) {
        throw new Error('Authorization token is missing');
      }
      console.log('here')

      const userJwt = authorizationToken;

      // Withdraw stake using unbonding lock ID
      const withdrawTxHash = await privyService.sendTransactionWithPrivyWalletGasSponsor(
        walletId,
        walletAddress,
        LIVEPEER_CONTRACTS.arbitrum.proxy as Hex,
        bondingManagerAbi,
        'withdrawStake',
        [unbondingLockId],
        userJwt
      );

      console.log('Withdraw stake transaction hash:', withdrawTxHash);

      return { success: true, txHash: withdrawTxHash };
    } catch (error: any) {
      console.error('Error withdrawing stake:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }

  /**
   * Withdraw earned fees from Livepeer using a Privy wallet
   */
  async withdrawFees(
    walletId: string,
    walletAddress: Hex,
    amount: string,
    authorizationToken: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      const amountWei = ethers.parseEther(amount);

      if (!authorizationToken) {
        throw new Error('Authorization token is missing');
      }

      const userJwt = authorizationToken;

      // Withdraw fees to the wallet address
      const withdrawTxHash = await privyService.writeToContractWithPrivyWallet(
        walletId,
        walletAddress,
        LIVEPEER_CONTRACTS.arbitrum.proxy as Hex,
        bondingManagerAbi,
        'withdrawFees',
        [walletAddress, amountWei], // recipient address and amount
        userJwt
      );

      console.log('Withdraw fees transaction hash:', withdrawTxHash);

      return { success: true, txHash: withdrawTxHash };
    } catch (error: any) {
      console.error('Error withdrawing fees:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }
}

export const livepeerService = new LivepeerService();