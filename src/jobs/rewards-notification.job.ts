import { notificationService } from '../services/notification.service';
import { userService } from '../services/user.service';
import { GraphQLClient } from 'graphql-request';

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

    // Get user's earnings for the time period
    const earnings = await this.getUserEarningsForPeriod(
      walletAddress,
      timePeriod.start,
      timePeriod.end
    );

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
   * Get user earnings for a specific time period from subgraph
   * Reverse-engineered from the yield calculation logic:
   * - Get delegator's current stake and starting stake
   * - Calculate the difference (rewards earned)
   * - Account for any bonds/unbonds during the period
   */
  private async getUserEarningsForPeriod(
    walletAddress: string,
    startDate: Date,
    endDate: Date
  ): Promise<{ totalRewards: string; rewardEventsCount: number } | null> {
    try {
      const startTimestamp = Math.floor(startDate.getTime() / 1000);
      const endTimestamp = Math.floor(endDate.getTime() / 1000);

      // Get delegator's current state and historical bond events
      const query = `
        query GetDelegatorEarnings($id: String!, $startTimestamp: Int!, $endTimestamp: Int!) {
          delegator(id: $id) {
            id
            bondedAmount
            principal
            fees
            delegatedAmount
            startRound
            lastClaimRound {
              id
            }
          }
          
          # Get bond events in the period to track stake changes
          bondEvents(
            where: {
              delegator: $id,
              timestamp_gte: $startTimestamp,
              timestamp_lte: $endTimestamp
            }
            orderBy: timestamp
            orderDirection: asc
          ) {
            id
            bondedAmount
            additionalAmount
            timestamp
            round {
              id
            }
          }
          
          # Get unbond events in the period
          unbondEvents(
            where: {
              delegator: $id,
              timestamp_gte: $startTimestamp,
              timestamp_lte: $endTimestamp
            }
            orderBy: timestamp
            orderDirection: asc
          ) {
            id
            amount
            withdrawRound
            timestamp
            round {
              id
            }
          }
        }
      `;

      const result: any = await this.graphqlClient.request(query, {
        id: walletAddress,
        startTimestamp,
        endTimestamp
      });

      if (!result.delegator) {
        return null;
      }

      const delegator = result.delegator;
      const currentBondedAmount = parseFloat(delegator.bondedAmount || '0');
      const principal = parseFloat(delegator.principal || '0');
      
      // Calculate total staked (bonded) during period
      let totalBonded = 0;

      if (result.bondEvents) {
         console.log('Bond events:', result.bondEvents);
        for (const event of result.bondEvents) {
          totalBonded += parseFloat(event.additionalAmount || '0');
        }
      }
      
      // Calculate total unbonded during period
      let totalUnbonded = 0;
      if (result.unbondEvents) {
        for (const event of result.unbondEvents) {
          totalUnbonded += parseFloat(event.amount || '0');
        }
      }
      
      // Rewards calculation:
      // If user has bonded amount, the rewards are the growth beyond principal
      // Rewards = (currentBonded + totalUnbonded) - (principal + totalBonded)
      // This accounts for compounding rewards earned over time
      
      let totalRewards = 0;
      
      if (currentBondedAmount > 0 || totalUnbonded > 0) {
        // Calculate what the stake should be without rewards
        const expectedStake = principal + totalBonded - totalUnbonded;
        
        // Actual stake (including compounded rewards)
        const actualStake = currentBondedAmount;
        
        // Rewards are the difference
        totalRewards = actualStake - expectedStake;
        
        // Also add any unbonded amount that was rewards
        if (totalUnbonded > 0 && totalUnbonded > principal) {
          const unbondedRewards = totalUnbonded - principal;
          totalRewards += Math.max(0, unbondedRewards);
        }
      }

      // Convert from wei to LPT
      totalRewards = totalRewards / 1e18;
      
      // Count reward events (estimate based on rounds)
      const rewardEventsCount = result.bondEvents?.length || 0;

      // Only return if rewards > 0
      if (totalRewards <= 0) {
        return null;
      }

      return {
        totalRewards: totalRewards.toString(),
        rewardEventsCount
      };
    } catch (error: any) {
      console.error(`[RewardsNotificationJob] Error fetching earnings for ${walletAddress}:`, error.message);
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
