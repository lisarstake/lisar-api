import { notificationService } from '../services/notification.service';
import { userService } from '../services/user.service';
import { GraphQLClient } from 'graphql-request';
import { GET_DELEGATOR_BY_ADDRESS_QUERY } from '../queries/subgraph.queries';
import { delegationService } from '../services/delegation.service';
import orchestratorYieldData from '../utils/orchestrator';

export class RewardsNotificationJob {
  private graphqlClient: GraphQLClient;

  constructor() {
    const graphqlEndpoint = process.env.LIVEPEER_SUBGRAPH_URL || '';
    const apiKey = process.env.SUBGRAPH_API_KEY || '';
    this.graphqlClient = new GraphQLClient(graphqlEndpoint, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    });
  }
  /**
   * Calculate and send reward notifications to all users
   * This job runs periodically to notify users of their earned rewards
   */
  async execute(periodType: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<void> {
    try {
      console.log(`[RewardsNotificationJob] Starting ${periodType} rewards calculation...`);
      
      // Get all users with wallet addresses
      const users = await userService.getAllUsersWithWallets();
      
      if (!users || users.length === 0) {
        console.log('[RewardsNotificationJob] No users found with wallet addresses');
        return;
      }

      console.log(`[RewardsNotificationJob] Processing rewards for ${users.length} users`);

      // Calculate time period
      const timePeriod = this.getTimePeriod(periodType);
      
      let successCount = 0;
      let errorCount = 0;

      // Process each user
      for (const user of users) {

        try {
          await this.processUserRewards(user, periodType, timePeriod);
          successCount++;
        } catch (error: any) {
          console.error(`[RewardsNotificationJob] Error processing user ${user.email}:`, error.message);
          errorCount++;
        }
      }

      console.log(`[RewardsNotificationJob] Completed ${periodType} rewards calculation.`);
      console.log(`[RewardsNotificationJob] Success: ${successCount}, Errors: ${errorCount}`);
      
    } catch (error: any) {
      console.error('[RewardsNotificationJob] Fatal error in rewards notification job:', error);
      throw error;
    }
  }

  /**
   * Process rewards for a single user
   */
  private async processUserRewards(
    user: any,
    periodType: 'daily' | 'weekly' | 'monthly',
    timePeriod: { start: Date; end: Date }
  ): Promise<void> {
    const walletAddress = user.wallet_address?.toLowerCase();
    
    if (!walletAddress) {
      console.log(`[RewardsNotificationJob] User ${user.email} has no wallet address`);
      return;
    }

    // For daily and weekly, use APY-based estimator (no fallback to timestamp/event logic)
    let earnings: any = null;
    if (periodType === 'daily' || periodType === 'weekly') {
      const estimate = await this.estimateRewardForDelegator(walletAddress, periodType);
      if (estimate && estimate.total > 0) {
        earnings = {
          totalRewards: String(estimate.total),
          rewardEventsCount: 0,
        };
      } else {
        // No rewards for this user in this period
        return;
      }
    } else {
      // For other periods, no APY-based estimator or historical calculation is available
      // Set earnings to null
      earnings = null;
    }

    if (!earnings || parseFloat(earnings.totalRewards) === 0) {
      console.log(`[RewardsNotificationJob] No rewards for user ${user.email}, ${walletAddress} in the last ${periodType} period`);
      return;
    }

    // Create notification for the user
    const rewardAmount = parseFloat(earnings.totalRewards).toFixed(4);
    
    console.log(`[RewardsNotificationJob] Found rewards for ${user.email}: ${rewardAmount} LPT (${earnings.rewardEventsCount} events)`);
    
    const notification = await notificationService.createNotification({
      user_id: user.user_id,
      title: `${this.getPeriodDisplayName(periodType)} Rewards Earned`,
      message: `You've earned ${rewardAmount} LPT tokens in the last ${periodType} period! Keep staking to earn more rewards.`,
      type: 'reward',
      metadata: {
        period: periodType,
        amount: rewardAmount,
        currency: 'LPT',
        startDate: timePeriod.start.toISOString(),
        endDate: timePeriod.end.toISOString(),
        rewardEvents: earnings.rewardEventsCount,
        walletAddress: walletAddress
      }
    });

    console.log(`[RewardsNotificationJob] Created notification for ${user.email}: ${rewardAmount} LPT`);
  }

  /**
   * Estimate daily reward for a delegator using the delegationService.calculateYield helper
   * Steps:
   *  - Fetch delegator via subgraph
   *  - Get current delegate (orchestrator) id and bondedAmount
   *  - Match orchestrator id to `orchestratorYieldData` to obtain APY
   *  - Call delegationService.calculateYield with currency 'LPT' and period '1 day'
   */
  /**
   * Estimate reward for a delegator using the delegationService.calculateYield helper
   * Supports 'daily' and 'weekly' periods.
   */
  private async estimateRewardForDelegator(
    walletAddress: string,
    periodType: 'daily' | 'weekly'
  ): Promise<{
    delegator?: string;
    delegate?: string;
    delegateName?: string;
    apy?: number;
    bondedAmountLPT?: number;
    total: number;
    breakdown?: Array<{
      delegate: string;
      delegateName?: string;
      apy: number;
      bondedAmountLPT: number;
      rewardLPT: number;
    }>;
  } | null> {
    try {
      const resp: any = await this.graphqlClient.request(GET_DELEGATOR_BY_ADDRESS_QUERY, {
        address: walletAddress.toLowerCase(),
      });

      const delegator = resp?.delegator;
      if (!delegator) return null;

      const delegateId = delegator.delegate?.id;
      const bondedAmountWei = delegator.bondedAmount || '0';
      const bondedAmountLPT = Number(bondedAmountWei) 
  
      if (!delegateId || bondedAmountLPT <= 0) {
        return null;
      }

      // Find orchestrator entry by id
      const orch = orchestratorYieldData.find(o => o.id && o.id.toLowerCase() === String(delegateId).toLowerCase());
      const apy = orch?.yield ?? 0;
      if (!apy || apy <= 0) {
        // no APY data available
        return null;
      }

      // Use the delegationService.calculateYield helper to compute rewards in LPT
      const periodStr = periodType === 'weekly' ? '1 week' : '1 day';
      const calc = await delegationService.calculateYield({
        amount: bondedAmountLPT,
        apy,
        period: periodStr,
        includeCurrencyConversion: false,
        currency: 'LPT',
      });

      if (!calc.success || !calc.data) return null;

      const periodResult = calc.data.periods && calc.data.periods.length ? calc.data.periods[0] : null;
      const reward = periodResult ? Number(periodResult.rewardAmount) : 0;
      return {
        delegator: delegator.id,
        delegate: delegateId,
        delegateName: orch?.name,
        apy,
        bondedAmountLPT,
        total: reward,
      };
    } catch (error: any) {
      console.error('[RewardsNotificationJob] estimateRewardForDelegator error:', error?.message || error);
      return null;
    }
  }


  /**
   * Calculate time period based on period type
   */
  private getTimePeriod(periodType: 'daily' | 'weekly' | 'monthly'): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();

    switch (periodType) {
      case 'daily':
        start.setDate(start.getDate() - 1);
        break;
      case 'weekly':
        start.setDate(start.getDate() - 7);
        break;
      case 'monthly':
        start.setMonth(start.getMonth() - 1);
        break;
    }

    return { start, end };
  }

  /**
   * Get display name for period type
   */
  private getPeriodDisplayName(periodType: 'daily' | 'weekly' | 'monthly'): string {
    switch (periodType) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      default:
        return 'Period';
    }
  }

  /**
   * Manual trigger for testing (can be called via admin endpoint)
   */
  async runManual(periodType: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      await this.execute(periodType);
      return {
        success: true,
        message: `${periodType} rewards notification job completed successfully`
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Job failed: ${error.message}`
      };
    }
  }
}

export const rewardsNotificationJob = new RewardsNotificationJob();
