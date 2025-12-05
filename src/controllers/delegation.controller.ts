import { Request, Response } from 'express';
import { delegationService } from '../services/delegation.service';
import { livepeerService } from '../protocols/services/livepeer.service';
import { transactionService } from '../services/transaction.service';
import { supabase } from '../config/supabase';
import { orchestratorService } from '../services/orchestrator.service';
import { GET_ACTIVE_TRANSCODERS_QUERY } from '../queries/subgraph.queries';
import stakingUtils from '../utils/staking';
import { sendMail } from '../services/email.service';
import { EmailTemplates } from '../utils/emailTemplates';

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
        // Create a transaction record (best-effort). Try to resolve user_id and email from users table by wallet_id
        (async () => {
          try {
            let userId = walletId;
            let userEmail = null;
            if (supabase) {
              const { data: user, error: userError } = await supabase
                .from('users')
                .select('user_id, email')
                .eq('wallet_id', walletId)
                .maybeSingle();

              if (userError) {
                console.error('Error fetching user for transaction creation:', userError);
              }

              if (user && (user as any).user_id) {
                userId = (user as any).user_id;
                userEmail = (user as any).email;
              }
            } else {
              console.warn('Supabase client not initialized; using walletId as user_id fallback');
            }

            const txCreateResult = await transactionService.createTransaction({
              user_id: userId,
              transaction_hash: result.txHash || '',
              transaction_type: 'delegation',
              created_at: new Date().toISOString(),
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

            // Send email notification for successful stake
            if (userEmail) {
              const firstName = userEmail.split('@')[0];
              const emailContent = EmailTemplates.transactionEmail({
                firstName,
                transactionType: 'delegation',
                amount: amount.toString(),
                tokenSymbol: 'LPT',
                transactionHash: result.txHash,
                timestamp: new Date().toISOString(),
                walletAddress
              });

              await sendMail({
                to: userEmail,
                subject: emailContent.subject,
                text: emailContent.text,
                html: emailContent.html
              });
            }
          } catch (err) {
            console.error('Error creating delegation transaction record or sending email:', err);
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
        // best-effort create a transaction record and send email
        (async () => {
          try {
            let userId = walletId;
            let userEmail = null;
            if (supabase) {
              const { data: user, error: userError } = await supabase
                .from('users')
                .select('user_id, email')
                .eq('wallet_id', walletId)
                .maybeSingle();

              if (userError) console.error('Error fetching user for transaction creation:', userError);
              if (user && (user as any).user_id) {
                userId = (user as any).user_id;
                userEmail = (user as any).email;
              }
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

            // Send email notification for successful move stake
            if (userEmail) {
              const firstName = userEmail.split('@')[0];
              const emailContent = EmailTemplates.transactionEmail({
                firstName,
                transactionType: 'delegation',
                amount: amount.toString(),
                tokenSymbol: 'LPT',
                transactionHash: result.txHash,
                timestamp: new Date().toISOString(),
                walletAddress
              });

              await sendMail({
                to: userEmail,
                subject: emailContent.subject,
                text: emailContent.text,
                html: emailContent.html
              });
            }
          } catch (err) {
            console.error('Error creating moveStake transaction record or sending email:', err);
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
        // Best-effort create undelegation transaction record and send email
        (async () => {
          try {
            let userId = walletId;
            let userEmail = null;
            if (supabase) {
              const { data: user, error: userError } = await supabase
                .from('users')
                .select('user_id, email')
                .eq('wallet_id', walletId)
                .maybeSingle();

              if (userError) console.error('Error fetching user for transaction creation:', userError);
              if (user && (user as any).user_id) {
                userId = (user as any).user_id;
                userEmail = (user as any).email;
              }
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

            // Send email notification for successful unstake
            if (userEmail) {
              const firstName = userEmail.split('@')[0];
              const emailContent = EmailTemplates.transactionEmail({
                firstName,
                transactionType: 'withdrawal',
                amount: amount.toString(),
                tokenSymbol: 'LPT',
                transactionHash: result.txHash,
                timestamp: new Date().toISOString(),
                walletAddress
              });

              await sendMail({
                to: userEmail,
                subject: emailContent.subject,
                text: emailContent.text,
                html: emailContent.html
              });
            }
          } catch (err) {
            console.error('Error creating undelegation transaction record or sending email:', err);
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
        // Best-effort create withdrawal transaction record (amount unknown from request) and send email
        (async () => {
          try {
            let userId = walletId;
            let userEmail = null;
            if (supabase) {
              const { data: user, error: userError } = await supabase
                .from('users')
                .select('user_id, email')
                .eq('wallet_id', walletId)
                .maybeSingle();

              if (userError) console.error('Error fetching user for transaction creation:', userError);
              if (user && (user as any).user_id) {
                userId = (user as any).user_id;
                userEmail = (user as any).email;
              }
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

            // Send email notification for successful withdrawal
            if (userEmail) {
              const firstName = userEmail.split('@')[0];
              const emailContent = EmailTemplates.transactionEmail({
                firstName,
                transactionType: 'withdrawal',
                amount: '0',
                tokenSymbol: 'LPT',
                transactionHash: result.txHash,
                timestamp: new Date().toISOString(),
                walletAddress
              });

              await sendMail({
                to: userEmail,
                subject: emailContent.subject,
                text: emailContent.text,
                html: emailContent.html
              });
            }
          } catch (err) {
            console.error('Error creating withdrawStake transaction record or sending email:', err);
          }
        })();

        return res.status(200).json({
          success: true,
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
              created_at: new Date().toISOString(),
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
  /**
 * Rebond an unbonding lock to a delegate (auto-selects correct contract call)
 */
  async rebond(req: Request, res: Response) {
    try {
      let { delegatorAddress, unbondingLockId, newPosPrev, newPosNext, to, walletId } = req.body;
      const authorizationToken = req.headers.authorization?.split(' ')[1] || req.body.authorizationToken;
      // Use delegatorAddress as the walletAddress (Privy wallet address is same as delegator)
      const walletAddress = delegatorAddress;
      if (!delegatorAddress || unbondingLockId === undefined) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }
      // Privy-only flow: require walletId and Authorization token
      const hasPrivy = !!walletId && !!authorizationToken;
      if (!hasPrivy) {
        return res.status(400).json({ success: false, error: 'Provide walletId and Authorization header' });
      }

      // If newPosPrev or newPosNext are missing or '0', compute using stakingUtils.getHint
      if (!newPosPrev || !newPosNext || newPosPrev === '0' || newPosNext === '0') {
        // Fetch active transcoders
        const { data } = await orchestratorService.getActiveTranscoders();
        // Map to Transcoder[] for getHint
        const transcoders = (data || []).map((o: any) => ({ id: o.id, totalStake: o.totalStake }));
        // Use 'to' if provided, else fallback to delegator's current delegate
        const targetId = to || (await delegationService.fetchDelegations(delegatorAddress))?.delegate?.id;
        const hint = stakingUtils.getHint(targetId, transcoders);
        newPosPrev = hint.newPosPrev;
        newPosNext = hint.newPosNext;
      }

      // Privy (gas-sponsored) flow only
      const result = await delegationService.rebond({
        delegatorAddress,
        unbondingLockId: Number(unbondingLockId),
        newPosPrev,
        newPosNext,
        to,
        walletId,
        walletAddress: walletAddress,
        authorizationToken
      } as any);
      if (result.success) {
        // Best-effort create rebond transaction record and send email
        (async () => {
          try {
            let userId = walletId;
            let userEmail = null;
            if (supabase) {
              const { data: user, error: userError } = await supabase
                .from('users')
                .select('user_id, email')
                .eq('wallet_id', walletId)
                .maybeSingle();

              if (userError) {
                console.error('Error fetching user for rebond transaction creation:', userError);
              }

              if (user && (user as any).user_id) {
                userId = (user as any).user_id;
                userEmail = (user as any).email;
              }
            } else {
              console.warn('Supabase client not initialized; using walletId as user_id fallback');
            }

            const txCreateResult = await transactionService.createTransaction({
              user_id: userId,
              transaction_hash: result.txHash || '',
              transaction_type: 'rebond',
              created_at: new Date().toISOString(),
              amount: '0',
              token_symbol: 'LPT',
              wallet_address: walletAddress,
              wallet_id: walletId,
              status: 'confirmed',
              source: 'delegation_api'
            });

            if (!txCreateResult.success) console.error('Failed to create rebond transaction record:', txCreateResult.error);

            // Send email notification for successful rebond
            if (userEmail) {
              const firstName = userEmail.split('@')[0];
              const emailContent = EmailTemplates.transactionEmail({
                firstName,
                transactionType: 'delegation',
                amount: '0',
                tokenSymbol: 'LPT',
                transactionHash: result.txHash,
                timestamp: new Date().toISOString(),
                walletAddress
              });

              await sendMail({
                to: userEmail,
                subject: emailContent.subject,
                text: emailContent.text,
                html: emailContent.html
              });
            }
          } catch (err) {
            console.error('Error creating rebond transaction record or sending email:', err);
          }
        })();

        return res.status(200).json({ success: true, txHash: result.txHash });
      } else {
        return res.status(500).json({ success: false, error: result.error });
      }
    } catch (error: any) {
      console.error('Error in rebond controller:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}

export const delegationController = new DelegationController();