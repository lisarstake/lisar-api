import { Request, Response } from 'express';
import { delegationService } from '../services/delegation.service';
import { livepeerService } from '../protocols/services/livepeer.service';
import { transactionService } from '../services/transaction.service';
import { supabase } from '../config/supabase';
import { orchestratorService } from '../services/orchestrator.service';
import { GET_ACTIVE_TRANSCODERS_QUERY } from '../queries/subgraph.queries';
import stakingUtils from '../utils/staking';

class DelegationController {
  async getDelegations(req: Request, res: Response): Promise<void> {
    const { delegator } = req.params;

    try {
      const data = await delegationService.fetchDelegations(delegator);
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Error in DelegationController:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch delegations' });
    }
  }

  /**
   * Handle delegation to a Livepeer orchestrator
   */
  async delegate(req: Request, res: Response): Promise<Response> {
    try {
      const { walletId, walletAddress, orchestratorAddress, amount } = req.body;
      const authorizationToken = req.headers.authorization?.split(' ')[1];

      if (!walletId || !walletAddress || !orchestratorAddress || !amount) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (!authorizationToken) {
        return res.status(401).json({ error: 'Authorization token is required' });
      }

      const result = await livepeerService.delegateToLivepeer(
        walletId,
        walletAddress,
        orchestratorAddress,
        amount,
        authorizationToken // Pass authorization context
      );

      if (result.success) {
        console.log('Delegation successful, txHash:', result.txHash);
        // Create a transaction record (best-effort). Try to resolve user_id from users table by wallet_id
        (async () => {
          try {
            let userId = walletId;
            if (supabase) {
              const { data: user, error: userError } = await supabase
                .from('users')
                .select('user_id')
                .eq('wallet_id', walletId)
                .maybeSingle();

              if (userError) {
                console.error('Error fetching user for transaction creation:', userError);
              }

              if (user && (user as any).user_id) {
                userId = (user as any).user_id;
              }
            } else {
              console.warn('Supabase client not initialized; using walletId as user_id fallback');
            }

            const txCreateResult = await transactionService.createTransaction({
              user_id: userId,
              transaction_hash: result.txHash || '',
              transaction_type: 'delegation',
              transaction_timestamp: new Date().toISOString(),
              amount: amount.toString(),
              token_symbol: 'LPT',
              wallet_address: walletAddress,
              wallet_id: walletId,
              status: 'confirmed',
              source: 'delegation_api'
            });
            console.log('Transaction record creation result:', txCreateResult);
            if (!txCreateResult.success) {
              console.error('Failed to create delegation transaction record:', txCreateResult.error);
            }
          } catch (err) {
            console.error('Error creating delegation transaction record:', err);
          }
        })();

        return res.status(200).json({ success: true, txHash: result.txHash });
      } else {
        return res.status(500).json({ success: false, error: result.error });
      }
    } catch (error: any) {
      console.error('Error in delegation controller:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * Move stake from one orchestrator to another (redelegate)
   */
  async moveStake(req: Request, res: Response): Promise<Response> {
    try {
      const { walletId, walletAddress, oldDelegate, newDelegate, amount } = req.body;
      const authorizationToken = req.headers.authorization?.split(' ')[1];

      if (!walletId || !walletAddress || !oldDelegate || !newDelegate || !amount) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      if (!authorizationToken) {
        return res.status(401).json({ success: false, error: 'Authorization token is required' });
      }

      const result = await livepeerService.moveStake(
        walletId,
        walletAddress,
        oldDelegate,
        newDelegate,
        amount,
        authorizationToken
      );

      if (result.success) {
        // best-effort create a transaction record
        (async () => {
          try {
            let userId = walletId;
            if (supabase) {
              const { data: user, error: userError } = await supabase
                .from('users')
                .select('user_id')
                .eq('wallet_id', walletId)
                .maybeSingle();

              if (userError) console.error('Error fetching user for transaction creation:', userError);
              if (user && (user as any).user_id) userId = (user as any).user_id;
            }

            const txCreateResult = await transactionService.createTransaction({
              user_id: userId,
              transaction_hash: result.txHash || '',
              transaction_type: 'move-stake',
              created_at: new Date().toISOString(),
              amount: amount.toString(),
              token_symbol: 'LPT',
              wallet_address: walletAddress,
              wallet_id: walletId,
              status: 'confirmed',
              source: 'delegation_api'
            });

            if (!txCreateResult.success) console.error('Failed to create moveStake transaction record:', txCreateResult.error);
          } catch (err) {
            console.error('Error creating moveStake transaction record:', err);
          }
        })();

        return res.status(200).json({ success: true, txHash: result.txHash });
      }

      return res.status(500).json({ success: false, error: result.error });
    } catch (error: any) {
      console.error('Error in moveStake controller:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async getAllDelegations(req: Request, res: Response): Promise<Response> {
    const { delegator } = req.params;

    try {
      const result = await delegationService.getAllDelegations(delegator);

      if (result.success) {
        return res.status(200).json({ success: true, data: result.data });
      } else {
        return res.status(404).json({ success: false, error: result.error });
      }
    } catch (error) {
      console.error('Error in getAllDelegations:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async getDelegationsToOrchestrators(req: Request, res: Response): Promise<Response> {
    const { delegator } = req.params;

    try {
      const result = await delegationService.getDelegationsToOrchestrators(delegator);

      if (result.success) {
        return res.status(200).json({ success: true, delegations: result.delegations });
      } else {
        return res.status(404).json({ success: false, error: result.error });
      }
    } catch (error) {
      console.error('Error in getDelegationsToOrchestrators:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  async getPendingFees(req: Request, res: Response): Promise<Response> {
    const { delegator, transcoder } = req.params;

    try {
      const result = await delegationService.getPendingFees(delegator, transcoder);

      if (result.success) {
        return res.status(200).json({ success: true, rewards: result.rewards });
      } else {
        return res.status(404).json({ success: false, error: result.error });
      }
    } catch (error) {
      console.error('Error in getPendingFees:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * Handle unbonding tokens from a Livepeer orchestrator
   */
  async undelegate(req: Request, res: Response): Promise<Response> {
    try {
      const { walletId, walletAddress, amount } = req.body;
      const authorizationToken = req.headers.authorization?.split(' ')[1];

      if (!walletId || !walletAddress || !amount) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      if (!authorizationToken) {
        return res.status(401).json({ success: false, error: 'Authorization token is required' });
      }

      const result = await livepeerService.undelegate(
        walletId,
        walletAddress,
        amount,
        authorizationToken // Pass authorization context
      );

      if (result.success) {
        // Best-effort create undelegation transaction record
        (async () => {
          try {
            let userId = walletId;
            if (supabase) {
              const { data: user, error: userError } = await supabase
                .from('users')
                .select('user_id')
                .eq('wallet_id', walletId)
                .maybeSingle();

              if (userError) console.error('Error fetching user for transaction creation:', userError);
              if (user && (user as any).user_id) userId = (user as any).user_id;
            } else {
              console.warn('Supabase client not initialized; using walletId as user_id fallback');
            }

            const txCreateResult = await transactionService.createTransaction({
              user_id: userId,
              transaction_hash: result.txHash || '',
              transaction_type: 'undelegation',
              created_at: new Date().toISOString(),
              amount: amount.toString(),
              token_symbol: 'LPT',
              wallet_address: walletAddress,
              wallet_id: walletId,
              status: 'confirmed',
              source: 'delegation_api'
            });

            if (!txCreateResult.success) console.error('Failed to create undelegation transaction record:', txCreateResult.error);
          } catch (err) {
            console.error('Error creating undelegation transaction record:', err);
          }
        })();

        return res.status(200).json({ success: true, txHash: result.txHash });
      } else {
        return res.status(500).json({ success: false, error: result.error });
      }
    } catch (error: any) {
      console.error('Error in undelegate controller:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * Handle withdrawing unbonded stake from Livepeer
   */
  async withdrawStake(req: Request, res: Response): Promise<Response> {
    try {
      const { walletId, walletAddress, unbondingLockId } = req.body;
      const authorizationToken = req.headers.authorization?.split(' ')[1];

      if (!walletId || !walletAddress || unbondingLockId === undefined) {
        return res.status(400).json({
          success: false,
          error: 'walletId, walletAddress, and unbondingLockId are required'
        });
      }

      if (!authorizationToken) {
        return res.status(401).json({
          success: false,
          error: 'Authorization token is required'
        });
      }

      const result = await livepeerService.withdrawStake(
        walletId,
        walletAddress,
        parseInt(unbondingLockId),
        authorizationToken
      );

      if (result.success) {
        // Best-effort create withdrawal transaction record (amount unknown from request)
        (async () => {
          try {
            let userId = walletId;
            if (supabase) {
              const { data: user, error: userError } = await supabase
                .from('users')
                .select('user_id')
                .eq('wallet_id', walletId)
                .maybeSingle();

              if (userError) console.error('Error fetching user for transaction creation:', userError);
              if (user && (user as any).user_id) userId = (user as any).user_id;
            } else {
              console.warn('Supabase client not initialized; using walletId as user_id fallback');
            }

            const txCreateResult = await transactionService.createTransaction({
              user_id: userId,
              transaction_hash: result.txHash || '',
              transaction_type: 'withdrawal',
              created_at: new Date().toISOString(),
              amount: '0',
              token_symbol: 'LPT',
              wallet_address: walletAddress,
              wallet_id: walletId,
              status: 'confirmed',
              source: 'delegation_api'
            });

            if (!txCreateResult.success) console.error('Failed to create withdrawStake transaction record:', txCreateResult.error);
          } catch (err) {
            console.error('Error creating withdrawStake transaction record:', err);
          }
        })();

        return res.status(200).json({
          success: true,
          message: 'Successfully withdrew unbonded stake from Livepeer',
          txHash: result.txHash
        });
      } else {
        return res.status(500).json({
          success: false,
          error: result.error
        });
      }
    } catch (error: any) {
      console.error('Error in withdrawStake controller:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * Rebonds an unbonding lock back to the delegator's current delegate using an optional hint.
   * If hints are omitted, the server will attempt to compute them from the subgraph active transcoders.
   */
  async rebond(req: Request, res: Response): Promise<Response> {
    try {
      const { walletId, walletAddress, unbondingLockId, newPosPrev, newPosNext } = req.body;
      const authorizationToken = req.headers.authorization?.split(' ')[1];

      if (!walletId || !walletAddress || unbondingLockId === undefined) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      if (!authorizationToken) {
        return res.status(401).json({ success: false, error: 'Authorization token is required' });
      }

      let prev = newPosPrev;
      let next = newPosNext;

      // Compute hints server-side if not provided
      if (!prev || !next) {
        try {
          const delegator = await delegationService.fetchDelegations(walletAddress);
          const lock = (delegator?.unbondingLocks || []).find((l: any) => String(l.id) === String(unbondingLockId) || String(l.unbondingLockId) === String(unbondingLockId));
          const delegateAddress = lock?.delegate?.id;

          if (delegateAddress) {
            const resp = await orchestratorService.fetchFromSubgraph(GET_ACTIVE_TRANSCODERS_QUERY, { page: 1, limit: 100 } as any);
            const transcoders = (resp?.data || []).map((t: any) => ({ id: (t.address || t.id), totalStake: String(t.totalStake || '0') }));
            const hint = stakingUtils.getHint(delegateAddress, transcoders);
            prev = prev || hint.newPosPrev;
            next = next || hint.newPosNext;
          } else {
            // default to empty address if we cannot determine
            prev = prev || '0x0000000000000000000000000000000000000000';
            next = next || '0x0000000000000000000000000000000000000000';
          }
        } catch (err) {
          console.warn('Failed to compute hints automatically:', err);
          prev = prev || '0x0000000000000000000000000000000000000000';
          next = next || '0x0000000000000000000000000000000000000000';
        }
      }

      const result = await livepeerService.rebondWithHint(
        walletId,
        walletAddress,
        parseInt(unbondingLockId, 10),
        prev,
        next,
        authorizationToken
      );

      if (result.success) {
        // Best-effort create rebond transaction record
        (async () => {
          try {
            let userId = walletId;
            if (supabase) {
              const { data: user, error: userError } = await supabase
                .from('users')
                .select('user_id')
                .eq('wallet_id', walletId)
                .maybeSingle();

              if (userError) console.error('Error fetching user for transaction creation:', userError);
              if (user && (user as any).user_id) userId = (user as any).user_id;
            } else {
              console.warn('Supabase client not initialized; using walletId as user_id fallback');
            }

            const txCreateResult = await transactionService.createTransaction({
              user_id: userId,
              transaction_hash: result.txHash || '',
              transaction_type: 'delegation',
              transaction_timestamp: new Date().toISOString(),
              amount: '0',
              token_symbol: 'LPT',
              wallet_address: walletAddress,
              wallet_id: walletId,
              status: 'confirmed',
              source: 'delegation_api'
            });

            if (!txCreateResult.success) console.error('Failed to create rebond transaction record:', txCreateResult.error);
          } catch (err) {
            console.error('Error creating rebond transaction record:', err);
          }
        })();

        return res.status(200).json({ success: true, txHash: result.txHash });
      }

      return res.status(500).json({ success: false, error: result.error });
    } catch (error: any) {
      console.error('Error in rebond controller:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * Handle withdrawing earned fees from Livepeer
   */
  async withdrawFees(req: Request, res: Response): Promise<Response> {
    try {
      const { walletId, walletAddress, amount } = req.body;
      const authorizationToken = req.headers.authorization?.split(' ')[1];

      if (!walletId || !walletAddress || !amount) {
        return res.status(400).json({
          success: false,
          error: 'walletId, walletAddress, and amount are required'
        });
      }

      if (!authorizationToken) {
        return res.status(401).json({
          success: false,
          error: 'Authorization token is required'
        });
      }

      const result = await livepeerService.withdrawFees(
        walletId,
        walletAddress,
        amount,
        authorizationToken
      );

      if (result.success) {
        // Best-effort create withdrawal (fees) transaction record
        (async () => {
          try {
            let userId = walletId;
            if (supabase) {
              const { data: user, error: userError } = await supabase
                .from('users')
                .select('user_id')
                .eq('wallet_id', walletId)
                .maybeSingle();

              if (userError) console.error('Error fetching user for transaction creation:', userError);
              if (user && (user as any).user_id) userId = (user as any).user_id;
            } else {
              console.warn('Supabase client not initialized; using walletId as user_id fallback');
            }

            const txCreateResult = await transactionService.createTransaction({
              user_id: userId,
              transaction_hash: result.txHash || '',
              transaction_type: 'withdrawal',
              created_at: new Date().toISOString(),
              amount: amount.toString(),
              token_symbol: 'LPT',
              wallet_address: walletAddress,
              wallet_id: walletId,
              status: 'confirmed',
              source: 'delegation_api'
            });

            if (!txCreateResult.success) console.error('Failed to create withdrawFees transaction record:', txCreateResult.error);
          } catch (err) {
            console.error('Error creating withdrawFees transaction record:', err);
          }
        })();

        return res.status(200).json({
          success: true,
          message: 'Successfully withdrew fees from Livepeer',
          txHash: result.txHash
        });
      } else {
        return res.status(500).json({ success: false, error: result.error });
      }
    } catch (error: any) {
      console.error('Error in withdrawFees controller:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  // duplicate/simpler rebond handler removed in favor of the enhanced rebond implementation above

  /**
   * Get delegator onchain transactions (pending and completed)
   */
  async getDelegatorTransactions(req: Request, res: Response): Promise<Response> {
    const { delegator } = req.params;

    try {
      const result = await delegationService.getDelegatorTransactions(delegator);

      if (result.success) {
        return res.status(200).json({
          success: true,
          data: result.data
        });
      } else {
        return res.status(404).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error in getDelegatorTransactions:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get delegator rewards over rounds
   */
  async getDelegatorRewards(req: Request, res: Response): Promise<Response> {
    const { delegator } = req.params;

    try {
      const result = await delegationService.getDelegatorRewards(delegator);

      if (result.success) {
        return res.status(200).json({
          success: true,
          data: result.data
        });
      } else {
        return res.status(404).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error in getDelegatorRewards:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * Get stake profile for a delegator
   */
  async getStakeProfile(req: Request, res: Response): Promise<Response> {
    const { delegator } = req.params;

    try {
      const result = await delegationService.getStakeProfile(delegator);

      if (result.success) {
        return res.status(200).json({
          success: true,
          data: result.data
        });
      } else {
        return res.status(404).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error in getStakeProfile:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Calculate yield/rewards for LPT delegation
   */
  async calculateYield(req: Request, res: Response): Promise<Response> {
    try {
      const {
        amount,
        apy,
        period,
        includeCurrencyConversion,
        currency
      } = req.body;

      // Validate required parameters
      if (!amount || !apy) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters: amount and apy are required'
        });
      }

      // Validate amount and apy are positive numbers
      const numericAmount = parseFloat(amount);

      // Handle APY as percentage string (e.g., "62%") or number (e.g., 62)
      let numericApy: number;
      if (typeof apy === 'string' && apy.endsWith('%')) {
        numericApy = parseFloat(apy.replace('%', ''));
      } else {
        numericApy = parseFloat(apy);
      }

      if (isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Amount must be a positive number'
        });
      }

      if (isNaN(numericApy) || numericApy <= 0) {
        return res.status(400).json({
          success: false,
          error: 'APY must be a positive number (can be provided as "62%" or 62)'
        });
      }

      // Validate period if provided
      if (period) {
        const validPeriods = ['1 day', '1 week', '1 month', '6 months', '1 year'];
        if (!validPeriods.includes(period)) {
          return res.status(400).json({
            success: false,
            error: `Invalid period. Must be one of: ${validPeriods.join(', ')}`
          });
        }
      }

      // Validate currency if provided (supported: USD, GBP, NGN, LPT)
      const supportedCurrencies = ['USD', 'GBP', 'NGN', 'LPT'];
      if (currency && !supportedCurrencies.includes(currency)) {
        return res.status(400).json({
          success: false,
          error: `Invalid currency. Must be one of: ${supportedCurrencies.join(', ')}`
        });
      }

      const result = await delegationService.calculateYield({
        amount: numericAmount,
        apy: numericApy,
        period: period as '1 day' | '1 week' | '1 month' | '6 months' | '1 year' | undefined,
        includeCurrencyConversion: includeCurrencyConversion === true,
        currency: (currency as 'USD' | 'GBP' | 'NGN' | 'LPT') || 'USD'
      });

      if (result.success) {
        return res.status(200).json({
          success: true,
          data: result.data
        });
      } else {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error: any) {
      console.error('Error in calculateYield controller:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * Rebond an unbonding lock back to a delegate (rebondFromUnbondedWithHint)
   */
  async rebondFromUnbonded(req: Request, res: Response): Promise<Response> {
    try {
      const { walletId, walletAddress, to, unbondingLockId, newPosPrev, newPosNext } = req.body;
      const authorizationToken = req.headers.authorization?.split(' ')[1];

      if (!walletId || !walletAddress || !to || unbondingLockId === undefined) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      if (!authorizationToken) {
        return res.status(401).json({ success: false, error: 'Authorization token is required' });
      }

      const result = await livepeerService.rebondFromUnbondedWithHint(
        walletId,
        walletAddress,
        to,
        parseInt(unbondingLockId, 10),
        newPosPrev,
        newPosNext,
        authorizationToken
      );

      if (result.success) {
        // Best-effort create rebond transaction record
        (async () => {
          try {
            let userId = walletId;
            if (supabase) {
              const { data: user, error: userError } = await supabase
                .from('users')
                .select('user_id')
                .eq('wallet_id', walletId)
                .maybeSingle();

              if (userError) console.error('Error fetching user for transaction creation:', userError);
              if (user && (user as any).user_id) userId = (user as any).user_id;
            } else {
              console.warn('Supabase client not initialized; using walletId as user_id fallback');
            }

            const txCreateResult = await transactionService.createTransaction({
              user_id: userId,
              transaction_hash: result.txHash || '',
              transaction_type: 'delegation',
              transaction_timestamp: new Date().toISOString(),
              amount: '0',
              token_symbol: 'LPT',
              wallet_address: walletAddress,
              wallet_id: walletId,
              status: 'confirmed',
              source: 'delegation_api'
            });

            if (!txCreateResult.success) console.error('Failed to create rebond transaction record:', txCreateResult.error);
          } catch (err) {
            console.error('Error creating rebond transaction record:', err);
          }
        })();

        return res.status(200).json({ success: true, txHash: result.txHash });
      } else {
        return res.status(500).json({ success: false, error: result.error });
      }
    } catch (error: any) {
      console.error('Error in rebondFromUnbonded controller:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}

export const delegationController = new DelegationController();