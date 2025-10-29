import { Request, Response } from 'express';
import { delegationService } from '../services/delegation.service';
import { livepeerService } from '../protocols/services/livepeer.service';

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
        return res.status(200).json({ success: true, txHash: result.txHash });
      } else {
        return res.status(500).json({ success: false, error: result.error });
      }
    } catch (error: any) {
      console.error('Error in delegation controller:', error);
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
        return res.status(400).json({ success: false,error: 'Missing required fields' });
      }

      if (!authorizationToken) {
        return res.status(401).json({success: false, error: 'Authorization token is required' });
      }

      const result = await livepeerService.undelegate(
        walletId,
        walletAddress,
        amount,
        authorizationToken // Pass authorization context
      );

      if (result.success) {
        return res.status(200).json({ success:true ,txHash: result.txHash });
      } else {
        return res.status(500).json({ success: false,error: result.error });
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
        return res.status(200).json({
          success: true,
          message: 'Successfully withdrew fees from Livepeer',
          txHash: result.txHash
        });
      } else {
        return res.status(500).json({
          success: false,
          error: result.error
        });
      }
    } catch (error: any) {
      console.error('Error in withdrawFees controller:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

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
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
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
}

export const delegationController = new DelegationController();