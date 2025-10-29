import { GraphQLClient } from 'graphql-request';
import { GET_EARNER_LEADERBOARD_QUERY, GET_TOP_EARNERS_BY_REWARDS_QUERY, GET_DELEGATOR_BY_ADDRESS_QUERY, GET_EARNINGS_BY_TIME_PERIOD_QUERY, GET_BOND_EVENTS_BY_TIME_PERIOD_QUERY, GET_DELEGATOR_EVENTS_BY_TIME_PERIOD_QUERY } from '../queries/subgraph.queries';
import { userService } from './user.service';
import { delegationService } from './delegation.service';

export class EarnerService {
  private graphqlEndpoint: string;
  private client: GraphQLClient;

  constructor() {
    this.graphqlEndpoint = process.env.LIVEPEER_SUBGRAPH_URL || '';
    const apiKey = process.env.SUBGRAPH_API_KEY || '';
    this.client = new GraphQLClient(this.graphqlEndpoint, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    });
  }

  // Get earner leaderboard by bonded amount (with optional time filtering)
  async getEarnerLeaderboard(params: {
    limit?: number;
    offset?: number;
    orderBy?: 'bondedAmount' | 'lifetimeReward' | 'delegatedAmount' | 'periodRewards' | 'periodBondingActivity';
    orderDirection?: 'asc' | 'desc';
    timePeriod?: 'daily' | 'weekly' | 'monthly' | 'custom';
    startDate?: string; // For custom period
    endDate?: string;   // For custom period
  }): Promise<{
    success: boolean;
    data?: {
      earners: Array<{
        rank: number;
        address: string;
        email: string;
        full_name?: string;
        bondedAmount: string;
        lifetimeReward: string;
        delegatedAmount: string;
        lastClaimRound: string;
        delegate: {
          address: string;
          feeShare: string;
          rewardCut: string;
        };
        // Time-filtered fields (only present when time filtering is used)
        periodRewards?: string;
        periodBondingActivity?: string;
        rewardEvents?: number;
        bondEvents?: number;
        topDelegate?: string;
      }>;
      pagination: {
        limit: number;
        offset: number;
        total: number;
      };
      // Period info (only present when time filtering is used)
      period?: {
        startTimestamp: number;
        endTimestamp: number;
        description: string;
      };
    };
    error?: string;
  }> {
    try {
      // Check if time filtering is requested
      const isTimeFiltered = params.timePeriod !== undefined;
      
      if (isTimeFiltered) {
        return this.getTimeFilteredLeaderboardData(params);
      } else {
        return this.getRegularLeaderboardData(params);
      }
    } catch (error) {
      console.error("Error fetching earner leaderboard:", error);
      return { success: false, error: "Failed to fetch earner leaderboard" };
    }
  }

  // Helper method for regular leaderboard (lifetime data)
  private async getRegularLeaderboardData(params: {
    limit?: number;
    offset?: number;
    orderBy?: 'bondedAmount' | 'lifetimeReward' | 'delegatedAmount' | 'periodRewards' | 'periodBondingActivity';
    orderDirection?: 'asc' | 'desc';
  }): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    // First, get all users with wallet addresses from Supabase
    const users = await userService.getAllUsersWithWallets();
    
    if (!users || users.length === 0) {
      return { success: false, error: "No users with wallet addresses found" };
    }

    // Extract wallet addresses
    const walletAddresses = users.map(user => user.wallet_address.toLowerCase());

    // Query delegator data and stake profiles for each wallet address
    const delegatorPromises = walletAddresses.map(async (address) => {
      try {
        // Get basic delegator data
        const delegatorResponse = await this.client.request<{ delegator: any }>(
          GET_DELEGATOR_BY_ADDRESS_QUERY,
          { address }
        );

        // Get stake profile with lifetime rewards
        const stakeProfile = await delegationService.getStakeProfile(address);

        return {
          address,
          delegatorData: delegatorResponse.delegator,
          stakeProfileData: stakeProfile.success ? stakeProfile.data : null,
          userData: users.find(u => u.wallet_address.toLowerCase() === address)
        };
      } catch (error) {
        console.error(`Error fetching data for address ${address}:`, error);
        return {
          address,
          delegatorData: null,
          stakeProfileData: null,
          userData: users.find(u => u.wallet_address.toLowerCase() === address)
        };
      }
    });

    const delegatorResults = await Promise.all(delegatorPromises);

    // Filter out users without delegation data and transform
    const earnersWithData = delegatorResults
      .filter(result => result.delegatorData && parseFloat(result.delegatorData.bondedAmount || '0') > 0)
      .map(result => ({
        address: result.address,
        email: result.userData?.email || '',
        full_name: result.userData?.full_name || '',
        bondedAmount: parseFloat(result.delegatorData.bondedAmount || '0'),
        lifetimeReward: parseFloat(result.stakeProfileData?.lifetimeRewards || '0'),
        delegatedAmount: parseFloat(result.delegatorData.delegatedAmount || '0'),
        lastClaimRound: result.delegatorData.lastClaimRound?.id || '0',
        delegate: {
          address: result.delegatorData.delegate?.id || '',
          feeShare: result.delegatorData.delegate?.feeShare || '0',
          rewardCut: result.delegatorData.delegate?.rewardCut || '0',
        },
      }));

    if (earnersWithData.length === 0) {
      return { success: false, error: "No earners found among registered users" };
    }

    // Sort by the specified field
    const orderBy = params.orderBy || 'bondedAmount';
    const orderDirection = params.orderDirection || 'desc';

    earnersWithData.sort((a, b) => {
      const aValue = a[orderBy as keyof typeof a] as number;
      const bValue = b[orderBy as keyof typeof b] as number;
      
      if (orderDirection === 'desc') {
        return bValue - aValue;
      } else {
        return aValue - bValue;
      }
    });

    // Apply pagination
    const limit = params.limit || 100;
    const offset = params.offset || 0;
    const paginatedEarners = earnersWithData.slice(offset, offset + limit);

    // Add ranks and convert numbers back to strings for response
    const rankedEarners = paginatedEarners.map((earner, index) => ({
      rank: offset + index + 1,
      address: earner.address,
      email: earner.email,
      full_name: earner.full_name,
      bondedAmount: earner.bondedAmount.toString(),
      lifetimeReward: earner.lifetimeReward.toString(),
      delegatedAmount: earner.delegatedAmount.toString(),
      lastClaimRound: earner.lastClaimRound,
      delegate: earner.delegate,
    }));

    return {
      success: true,
      data: {
        earners: rankedEarners,
        pagination: {
          limit,
          offset,
          total: earnersWithData.length,
        },
      },
    };
  }

  // Helper method for time-filtered leaderboard
  private async getTimeFilteredLeaderboardData(params: {
    limit?: number;
    offset?: number;
    orderBy?: 'bondedAmount' | 'lifetimeReward' | 'delegatedAmount' | 'periodRewards' | 'periodBondingActivity';
    orderDirection?: 'asc' | 'desc';
    timePeriod?: 'daily' | 'weekly' | 'monthly' | 'custom';
    startDate?: string;
    endDate?: string;
  }): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    // Calculate time period
    const now = Math.floor(Date.now() / 1000);
    let startTimestamp: number;
    let endTimestamp: number = now;
    let description: string;

    switch (params.timePeriod) {
      case 'daily':
        startTimestamp = now - (24 * 60 * 60); // 24 hours ago
        description = 'Last 24 hours';
        break;
      case 'weekly':
        startTimestamp = now - (7 * 24 * 60 * 60); // 7 days ago
        description = 'Last 7 days';
        break;
      case 'monthly':
        startTimestamp = now - (30 * 24 * 60 * 60); // 30 days ago
        description = 'Last 30 days';
        break;
      case 'custom':
        if (!params.startDate || !params.endDate) {
          return { success: false, error: "Start date and end date are required for custom period" };
        }
        startTimestamp = Math.floor(new Date(params.startDate).getTime() / 1000);
        endTimestamp = Math.floor(new Date(params.endDate).getTime() / 1000);
        description = `${params.startDate} to ${params.endDate}`;
        break;
      default:
        return { success: false, error: "Invalid time period" };
    }

    // Get all users with wallets
    const users = await userService.getAllUsersWithWallets();
    if (!users || users.length === 0) {
      return { success: false, error: "No users with wallet addresses found" };
    }

    const walletAddresses = users.map(user => user.wallet_address.toLowerCase());

    // Get basic delegator data first
    const delegatorResponse = await this.client.request<{ delegators: any[] }>(
      GET_EARNINGS_BY_TIME_PERIOD_QUERY,
      {
        delegators: walletAddresses
      }
    );

    // Get detailed events for each delegator within the time period
    const delegatorEventPromises = walletAddresses.map(async (address) => {
      try {
        const eventsResponse = await this.client.request<{ transactions: any[] }>(
          GET_DELEGATOR_EVENTS_BY_TIME_PERIOD_QUERY,
          {
            delegator: address,
            startTimestamp,
            endTimestamp
          }
        );
        return { address, events: eventsResponse.transactions || [] };
      } catch (error) {
        console.warn(`Failed to get events for delegator ${address}:`, error);
        return { address, events: [] };
      }
    });

    const delegatorEventsResults = await Promise.all(delegatorEventPromises);
    const delegatorEventsMap = new Map(delegatorEventsResults.map(r => [r.address, r.events]));

    // Get basic delegator data for lifetime stats
    const delegatorPromises = walletAddresses.map(async (address) => {
      try {
        const delegatorResponse = await this.client.request<{ delegator: any }>(
          GET_DELEGATOR_BY_ADDRESS_QUERY,
          { address }
        );
        const stakeProfile = await delegationService.getStakeProfile(address);
        
        return {
          address,
          delegatorData: delegatorResponse.delegator,
          stakeProfileData: stakeProfile.success ? stakeProfile.data : null,
        };
      } catch (error) {
        return { address, delegatorData: null, stakeProfileData: null };
      }
    });

    const delegatorResults = await Promise.all(delegatorPromises);
    const delegatorMap = new Map(delegatorResults.map(r => [r.address, r]));

    // Aggregate data by delegator
    const delegatorActivity = new Map<string, {
      address: string;
      periodRewards: number;
      periodBondingActivity: number;
      rewardEvents: number;
      bondEvents: number;
      delegates: Map<string, number>;
    }>();

    // Process delegator events to aggregate activity
    delegatorEventsMap.forEach((transactions, delegatorAddress) => {
      if (!delegatorActivity.has(delegatorAddress)) {
        delegatorActivity.set(delegatorAddress, {
          address: delegatorAddress,
          periodRewards: 0,
          periodBondingActivity: 0,
          rewardEvents: 0,
          bondEvents: 0,
          delegates: new Map()
        });
      }

      const activity = delegatorActivity.get(delegatorAddress)!;

      transactions.forEach((transaction: any) => {
        transaction.events?.forEach((event: any) => {
          if (event.__typename === 'RewardEvent') {
            activity.periodRewards += parseFloat(event.rewardTokens || '0');
            activity.rewardEvents += 1;
            
            // Track delegate activity
            const delegateId = event.delegate?.id;
            if (delegateId) {
              const currentDelegateRewards = activity.delegates.get(delegateId) || 0;
              activity.delegates.set(delegateId, currentDelegateRewards + parseFloat(event.rewardTokens || '0'));
            }
          } else if (event.__typename === 'BondEvent') {
            activity.periodBondingActivity += parseFloat(event.additionalAmount || '0');
            activity.bondEvents += 1;
          }
        });
      });
    });

    // Convert to array and enhance with user data and lifetime stats
    const earnersWithData = Array.from(delegatorActivity.values())
      .filter(activity => activity.periodRewards > 0 || activity.periodBondingActivity > 0)
      .map(activity => {
        const userData = users.find(u => u.wallet_address.toLowerCase() === activity.address);
        const delegatorInfo = delegatorMap.get(activity.address);
        
        // Find top delegate by rewards
        let topDelegate = '';
        let maxRewards = 0;
        activity.delegates.forEach((rewards, delegateId) => {
          if (rewards > maxRewards) {
            maxRewards = rewards;
            topDelegate = delegateId;
          }
        });

        return {
          address: activity.address,
          email: userData?.email || '',
          full_name: userData?.full_name || '',
          bondedAmount: parseFloat(delegatorInfo?.delegatorData?.bondedAmount || '0'),
          lifetimeReward: parseFloat(delegatorInfo?.stakeProfileData?.lifetimeRewards || '0'),
          delegatedAmount: parseFloat(delegatorInfo?.delegatorData?.delegatedAmount || '0'),
          lastClaimRound: delegatorInfo?.delegatorData?.lastClaimRound?.id || '0',
          delegate: {
            address: delegatorInfo?.delegatorData?.delegate?.id || '',
            feeShare: delegatorInfo?.delegatorData?.delegate?.feeShare || '0',
            rewardCut: delegatorInfo?.delegatorData?.delegate?.rewardCut || '0',
          },
          periodRewards: activity.periodRewards,
          periodBondingActivity: activity.periodBondingActivity,
          rewardEvents: activity.rewardEvents,
          bondEvents: activity.bondEvents,
          topDelegate
        };
      });

    // Sort by the specified field
    const orderBy = params.orderBy || 'periodRewards';
    const orderDirection = params.orderDirection || 'desc';

    earnersWithData.sort((a, b) => {
      const aValue = a[orderBy as keyof typeof a] as number;
      const bValue = b[orderBy as keyof typeof b] as number;
      
      if (orderDirection === 'desc') {
        return bValue - aValue;
      } else {
        return aValue - bValue;
      }
    });

    // Apply pagination
    const limit = params.limit || 100;
    const offset = params.offset || 0;
    const paginatedEarners = earnersWithData.slice(offset, offset + limit);

    // Add ranks and format for response
    const rankedEarners = paginatedEarners.map((earner, index) => ({
      rank: offset + index + 1,
      address: earner.address,
      email: earner.email,
      full_name: earner.full_name,
      bondedAmount: earner.bondedAmount.toString(),
      lifetimeReward: earner.lifetimeReward.toString(),
      delegatedAmount: earner.delegatedAmount.toString(),
      lastClaimRound: earner.lastClaimRound,
      delegate: earner.delegate,
      periodRewards: earner.periodRewards.toString(),
      periodBondingActivity: earner.periodBondingActivity.toString(),
      rewardEvents: earner.rewardEvents,
      bondEvents: earner.bondEvents,
      topDelegate: earner.topDelegate,
    }));

    return {
      success: true,
      data: {
        earners: rankedEarners,
        period: {
          startTimestamp,
          endTimestamp,
          description
        },
        pagination: {
          limit,
          offset,
          total: earnersWithData.length,
        },
      },
    };
  }

  // Get top earners by recent rewards
  async getTopEarnersByRewards(limit: number = 50): Promise<{
    success: boolean;
    data?: {
      topEarners: Array<{
        rank: number;
        address: string;
        recentReward: string;
        bondedAmount: string;
        fees: string;
        delegatedAmount: string;
        round: string;
        delegate: string;
      }>;
    };
    error?: string;
  }> {
    try {
      const response = await this.client.request<{ rewardEvents: any[] }>(
        GET_TOP_EARNERS_BY_REWARDS_QUERY,
        { first: limit }
      );

      if (!response.rewardEvents || response.rewardEvents.length === 0) {
        return { success: false, error: "No recent rewards found" };
      }

      // Transform and rank the data
      const topEarners = response.rewardEvents.map((event, index) => ({
        rank: index + 1,
        address: event.delegator?.id || '',
        recentReward: event.rewardTokens || '0',
        bondedAmount: event.delegator?.bondedAmount || '0',
        fees: event.delegator?.fees || '0',
        delegatedAmount: event.delegator?.delegatedAmount || '0',
        round: event.round?.id || '0',
        delegate: event.delegate?.id || '',
      }));

      return {
        success: true,
        data: {
          topEarners,
        },
      };
    } catch (error) {
      console.error("Error fetching top earners by rewards:", error);
      return { success: false, error: "Failed to fetch top earners by rewards" };
    }
  }

  // Get earner statistics
  async getEarnerStats(): Promise<{
    success: boolean;
    data?: {
      totalUsers: number;
      totalEarners: number;
      totalBondedAmount: string;
      totalLifetimeRewards: string;
      averageBondedAmount: string;
      averageLifetimeReward: string;
    };
    error?: string;
  }> {
    try {
      // First, get all users with wallet addresses from Supabase
      const users = await userService.getAllUsersWithWallets();
      
      if (!users || users.length === 0) {
        return { success: false, error: "No users with wallet addresses found" };
      }

      // Extract wallet addresses
      const walletAddresses = users.map(user => user.wallet_address.toLowerCase());

      // Query delegator data and stake profiles for each wallet address
      const delegatorPromises = walletAddresses.map(async (address) => {
        try {
          // Get basic delegator data
          const delegatorResponse = await this.client.request<{ delegator: any }>(
            GET_DELEGATOR_BY_ADDRESS_QUERY,
            { address }
          );

          // Get stake profile with lifetime rewards
          const stakeProfile = await delegationService.getStakeProfile(address);

          return {
            delegator: delegatorResponse.delegator,
            stakeProfile: stakeProfile.success ? stakeProfile.data : null
          };
        } catch (error) {
          console.error(`Error fetching data for address ${address}:`, error);
          return {
            delegator: null,
            stakeProfile: null
          };
        }
      });

      const delegatorResults = await Promise.all(delegatorPromises);

      // Filter out null results and users with no bonded amount
      const activeDelegators = delegatorResults.filter(
        result => result.delegator && parseFloat(result.delegator.bondedAmount || '0') > 0
      );

      if (activeDelegators.length === 0) {
        return { 
          success: true, 
          data: {
            totalUsers: users.length,
            totalEarners: 0,
            totalBondedAmount: '0',
            totalLifetimeRewards: '0',
            averageBondedAmount: '0',
            averageLifetimeReward: '0',
          }
        };
      }

      const totalEarners = activeDelegators.length;
      const totalBondedAmount = activeDelegators.reduce(
        (sum, result) => sum + parseFloat(result.delegator.bondedAmount || '0'),
        0
      );
      const totalLifetimeRewards = activeDelegators.reduce(
        (sum, result) => sum + parseFloat(result.stakeProfile?.lifetimeRewards || '0'),
        0
      );
      const averageBondedAmount = totalBondedAmount / totalEarners;
      const averageLifetimeReward = totalLifetimeRewards / totalEarners;

      return {
        success: true,
        data: {
          totalUsers: users.length,
          totalEarners,
          totalBondedAmount: totalBondedAmount.toString(),
          totalLifetimeRewards: totalLifetimeRewards.toString(),
          averageBondedAmount: averageBondedAmount.toString(),
          averageLifetimeReward: averageLifetimeReward.toString(),
        },
      };
    } catch (error) {
      console.error("Error fetching earner statistics:", error);
      return { success: false, error: "Failed to fetch earner statistics" };
    }
  }
}

export const earnerService = new EarnerService();
