import { privyService } from '../../integrations/privy/privy.service';
import { arbitrumOne, LIVEPEER_CONTRACTS } from '../config/livepeer.config';
import bondingManagerAbi from '../abis/livepeer/bondingManager.abi.json';
import LPT_TOKEN_ABI from '../abis/livepeer/lptToken.abi.json';
import { ethers } from 'ethers';
import { type Hex} from 'viem';
import { orchestratorService } from '../../services/orchestrator.service';
import { GET_ACTIVE_TRANSCODERS_QUERY } from '../../queries/subgraph.queries';
import stakingUtils from '../../utils/staking';
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

  /**
   * Move stake from one delegate to another using bondWithHint.
   * This computes list hints from the subgraph active transcoders and calls bondWithHint on-chain.
   * bondWithHint(_amount, _to, _oldDelegateNewPosPrev, _oldDelegateNewPosNext, _currDelegateNewPosPrev, _currDelegateNewPosNext)
   */
  async moveStake(
    walletId: string,
    walletAddress: Hex,
    oldDelegate: Hex,
    newDelegate: Hex,
    amount: string,
    authorizationToken: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!authorizationToken) {
        throw new Error('Authorization context or private key is missing');
      }

      const userJwt = authorizationToken;
      console.log(userJwt)

      // Fetch active transcoders from subgraph (ordered by totalStake desc)
      const resp = await orchestratorService.fetchFromSubgraph(GET_ACTIVE_TRANSCODERS_QUERY, { page: 1, limit: 100, sortBy: 'totalStake', sortOrder: 'desc' } as any);
      const transcoders = (resp?.data || []).map((t: any) => ({ id: (t.address || t.id), totalStake: (t.totalStake || t.totalStake)?.toString?.() || String(t.totalStake || '0') }));

      // compute hints for old and new delegates
      const oldHint = stakingUtils.getHint(String(oldDelegate), transcoders);
      const newHint = stakingUtils.getHint(String(newDelegate), transcoders);

      const amountWei = ethers.parseEther(amount);

      // Step 1: Approve the bonding manager proxy to spend LPT on behalf of the wallet
 
        const approveTxHash = await privyService.sendTransactionWithPrivyWalletGasSponsor(
          walletId,
          walletAddress,
          LIVEPEER_CONTRACTS.arbitrum.token as Hex,
          LPT_TOKEN_ABI,
          'approve',
          [LIVEPEER_CONTRACTS.arbitrum.proxy as Hex, amountWei],
          userJwt
        );
        console.log('Approve transaction hash (moveStake):', approveTxHash);
  

      // Step 2: Call bondWithHint to move stake (delegation) with list hints
      const txHash = await privyService.sendTransactionWithPrivyWalletGasSponsor(
        walletId,
        walletAddress,
        LIVEPEER_CONTRACTS.arbitrum.proxy as Hex,
        bondingManagerAbi,
        'bondWithHint',
        [amountWei, newDelegate, oldHint.newPosPrev, oldHint.newPosNext, newHint.newPosPrev, newHint.newPosNext],
        userJwt
      );

      return { success: true, txHash:txHash };
    } catch (error: any) {
      console.error('Error moving stake (transferBond):', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }

  /**
   * Rebond an unbonding lock back to a delegate (rebondFromUnbondedWithHint)
   * - to: target delegate address
   * - unbondingLockId: id of the unbonding lock
   * - newPosPrev/newPosNext: optional list hint addresses for insertion
   */
  async rebondFromUnbondedWithHint(
    walletId: string,
    walletAddress: Hex,
    to: Hex,
    unbondingLockId: number,
    newPosPrev?: Hex,
    newPosNext?: Hex,
    authorizationToken?: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!authorizationToken) {
        throw new Error('Authorization context or private key is missing');
      }

      const userJwt = authorizationToken;

      // Fetch active transcoders to compute hints if not provided
      const resp = await orchestratorService.fetchFromSubgraph(GET_ACTIVE_TRANSCODERS_QUERY, { page: 1, limit: 100, sortBy: 'totalStake', sortOrder: 'desc' } as any);
      const transcoders = (resp?.data || []).map((t: any) => ({ id: (t.address || t.id), totalStake: (t.totalStake || t.totalStake)?.toString?.() || String(t.totalStake || '0') }));

      const hint = (newPosPrev && newPosNext) ? { newPosPrev, newPosNext } : stakingUtils.getHint(String(to), transcoders);

      const txHash = await privyService.sendTransactionWithPrivyWalletGasSponsor(
        walletId,
        walletAddress,
        LIVEPEER_CONTRACTS.arbitrum.proxy as Hex,
        bondingManagerAbi,
        'rebondFromUnbondedWithHint',
        [to, unbondingLockId, hint.newPosPrev, hint.newPosNext],
        userJwt
      );

      return { success: true, txHash };
    } catch (error: any) {
      console.error('Error rebonding (rebondFromUnbondedWithHint):', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }

  /**
   * Rebonds an unbonding lock to the delegator's current delegate with an optional list hint.
   * Calls bondingManager.rebondWithHint(unbondingLockId, newPosPrev, newPosNext)
   */
  async rebondWithHint(
    walletId: string,
    walletAddress: Hex,
    unbondingLockId: number,
    newPosPrev: Hex,
    newPosNext: Hex,
    authorizationToken: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!authorizationToken) {
        throw new Error('Authorization context or private key is missing');
      }

      const userJwt = authorizationToken;

      const txHash = await privyService.sendTransactionWithPrivyWalletGasSponsor(
        walletId,
        walletAddress,
        LIVEPEER_CONTRACTS.arbitrum.proxy as Hex,
        bondingManagerAbi,
        'rebondWithHint',
        [unbondingLockId, newPosPrev, newPosNext],
        userJwt
      );

      return { success: true, txHash };
    } catch (error: any) {
      console.error('Error rebondWithHint:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }

  /**
   * Rebonds an unbonding lock using an optional list hint for insertion position.
   * Calls bondingManager.rebondWithHint(_unbondingLockId, _newPosPrev, _newPosNext)
   */
  // duplicate removed; single implementation exists above
}

export const livepeerService = new LivepeerService();