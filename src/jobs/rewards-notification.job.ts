import { notificationService } from '../services/notification.service';
import { userService } from '../services/user.service';
import { GraphQLClient } from 'graphql-request';
import { GET_DELEGATOR_REWARD_EVENTS_QUERY } from '../queries/subgraph.queries';

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
   * Get user earnings for a specific time period using actual RewardEvents from subgraph
   * This is the most accurate method as it uses historical reward data directly
   */
  private async getUserEarningsForPeriod(
    walletAddress: string,
    startDate: Date,
    endDate: Date
  ): Promise<{ totalRewards: string; rewardEventsCount: number } | null> {
    try {
      const startTimestamp = Math.floor(startDate.getTime() / 1000);
      const endTimestamp = Math.floor(endDate.getTime() / 1000);

      console.log(`[RewardsNotificationJob] Fetching rewards for ${walletAddress} from ${startDate.toISOString()} to ${endDate.toISOString()}`);

      // Query RewardEvents directly from the subgraph
      const result: any = await this.graphqlClient.request(
        GET_DELEGATOR_REWARD_EVENTS_QUERY,
        {
          delegatorId: walletAddress.toLowerCase(),
          startTimestamp,
          endTimestamp
        }
      );

      if (!result.rewardEvents || result.rewardEvents.length === 0) {
        console.log(`[RewardsNotificationJob] No reward events found for ${walletAddress} in the period`);
        return null;
      }

      console.log(`[RewardsNotificationJob] Found ${result.rewardEvents.length} reward events for ${walletAddress}`);

      // Sum up all rewardTokens from the events
      let totalRewardsWei = 0;
      const roundRewards: Map<string, number> = new Map();

      for (const event of result.rewardEvents) {
        const rewardTokens = parseFloat(event.rewardTokens || '0');
        totalRewardsWei += rewardTokens;

        // Track rewards per round for detailed logging
        const roundId = event.round?.id || 'unknown';
        const currentRoundReward = roundRewards.get(roundId) || 0;
        roundRewards.set(roundId, currentRoundReward + rewardTokens);
      }

      // Convert from wei to LPT (divide by 1e18)
      const totalRewards = totalRewardsWei / 1e18;

      // Log detailed breakdown
      console.log(`[RewardsNotificationJob] Rewards breakdown for ${walletAddress}:`);
      console.log(`  - Total reward events: ${result.rewardEvents.length}`);
      console.log(`  - Total rewards (wei): ${totalRewardsWei}`);
      console.log(`  - Total rewards (LPT): ${totalRewards.toFixed(6)}`);
      console.log(`  - Rounds with rewards: ${roundRewards.size}`);
      
      // Log top 5 rounds by rewards
      const topRounds = Array.from(roundRewards.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      
      if (topRounds.length > 0) {
        console.log(`  - Top rounds:`);
        topRounds.forEach(([roundId, reward], index) => {
          console.log(`    ${index + 1}. Round ${roundId}: ${(reward / 1e18).toFixed(6)} LPT`);
        });
      }

      // Only return if rewards > 0
      if (totalRewards <= 0) {
        console.log(`[RewardsNotificationJob] Total rewards is zero or negative for ${walletAddress}`);
        return null;
      }

      return {
        totalRewards: totalRewards.toFixed(6),
        rewardEventsCount: result.rewardEvents.length
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
