import { GraphQLClient } from 'graphql-request';
import { GET_DELEGATOR_BY_ADDRESS_QUERY, GET_ALL_DELEGATIONS_QUERY, GET_BOND_EVENTS_QUERY, GET_PENDING_REWARDS_QUERY, GET_PROFILE_INFO, GET_EVENTS } from '../queries/subgraph.queries';
import { protocolService } from './protocol.service';
import { ethers } from 'ethers';
import { arbitrumOne, LIVEPEER_CONTRACTS } from '../protocols/config/livepeer.config';
import bondingManagerAbi from '../protocols/abis/livepeer/bondingManager.abi.json';

export class DelegationService {
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

  async fetchDelegations(delegator: string): Promise<any> {
    const query = GET_DELEGATOR_BY_ADDRESS_QUERY;

    try {
      const response = await this.client.request<{ delegator: any }>(query, { address: delegator });
      return response.delegator;
    } catch (error) {
      console.error('Error fetching delegations:', error);
      throw error;
    }
  }

  // Get all delegations for a delegator
  async getAllDelegations(delegatorAddress: string): Promise<{success: boolean, data?: any, error?: string}> {
    const query = GET_ALL_DELEGATIONS_QUERY;

    try {
      const response = await this.client.request<{ delegator: any }>(query, {
        delegator: delegatorAddress.toLowerCase(),
      });

      if (!response.delegator) {
        return { success: false, error: "Delegator not found" };
      }

      return {
        success: true,
        data: {
          delegator: response.delegator,
          delegations: [], // Empty array since delegations field doesn't exist
        },
      };
    } catch (error) {
      console.error("Error fetching all delegations:", error);
      return { success: false, error: "Failed to fetch delegations" };
    }
  }

  // Get actual delegations from a delegator to orchestrators using bond events
  async getDelegationsToOrchestrators(delegatorAddress: string): Promise<{success: boolean, delegations?: Array<{delegate: string, amount: string}>, error?: string}> {
    const query = GET_BOND_EVENTS_QUERY;

    try {
      const response = await this.client.request<{ bondEvents: any[] }>(query, {
        delegator: delegatorAddress.toLowerCase(),
      });

      if (!response.bondEvents || response.bondEvents.length === 0) {
        return { success: false, error: "No delegations found" };
      }

      // Group bond events by delegate to get total delegation amounts
      const delegationsMap = new Map<string, number>();

      response.bondEvents.forEach((event: any) => {
        const delegate = event.newDelegate.id;
        const additionalAmount = parseFloat(event.additionalAmount || "0");

        if (delegationsMap.has(delegate)) {
          delegationsMap.set(delegate, delegationsMap.get(delegate)! + additionalAmount);
        } else {
          delegationsMap.set(delegate, additionalAmount);
        }
      });

      // Convert map to array of delegations
      const delegations = Array.from(delegationsMap.entries()).map(([delegate, amount]) => ({
        delegate,
        amount: amount.toString(),
      }));

      return {
        success: true,
        delegations: delegations,
      };
    } catch (error) {
      console.error("Error fetching delegations to orchestrators:", error);
      return { success: false, error: "Failed to fetch delegations to orchestrators" };
    }
  }

  // Get pending rewards for a delegator from a specific transcoder
  async getPendingFees(delegatorAddress: string, transcoderAddress: string): Promise<{success: boolean, rewards?: string, error?: string}> {
    const query = GET_PENDING_REWARDS_QUERY;

    try {
      const response = await this.client.request<{ delegator: any }>(query, {
        delegator: delegatorAddress.toLowerCase(),
        transcoder: transcoderAddress.toLowerCase(),
      });
      console.log(response,"response")
      if (!response.delegator) {
        return { success: false, error: "Delegator not found" };
      }
    
      return {
        success: true,
        rewards: response.delegator.fees || "0",
      };
    } catch (error) {
      console.error("Error fetching pending rewards:", error);
      return { success: false, error: "Failed to fetch pending rewards" };
    }
  }

  // Get delegator onchain transactions (pending and completed stake transactions)
  async getDelegatorTransactions(delegatorAddress: string): Promise<{
    success: boolean, 
    data?: {
      pendingStakeTransactions: Array<any>,
      completedStakeTransactions: Array<any>,
      currentRound: string
    }, 
    error?: string
  }> {
    const query = GET_PROFILE_INFO;

    try {
      // Get current round from protocol service
      const protocolStatus = await protocolService.getStatus();
      if (!protocolStatus) {
        return { success: false, error: "Failed to fetch current round information" };
      }

      const currentRoundId = protocolStatus.currentRound.toString();
      const roundLength = protocolStatus.roundLength || 20; // Default round length in hours (Livepeer rounds are ~20 hours)

      const response = await this.client.request<{ delegator: any }>(query, {
        id: delegatorAddress.toLowerCase(),
      });

      if (!response.delegator) {
        return { success: false, error: "Delegator not found" };
      }

      const delegator = response.delegator;
      const unbondingLocks = delegator.unbondingLocks || [];

      // Filter and enhance pending stake transactions (withdrawRound > currentRound)
      const pendingStakeTransactions = unbondingLocks
        .filter((item: any) => 
          item.withdrawRound && 
          parseInt(item.withdrawRound, 10) > parseInt(currentRoundId, 10)
        )
        .map((item: any) => {
          const withdrawRound = parseInt(item.withdrawRound, 10);
          const currentRound = parseInt(currentRoundId, 10);
          const roundsRemaining = withdrawRound - currentRound;
          const hoursRemaining = roundsRemaining * roundLength;
          const daysRemaining = Math.floor(hoursRemaining / 24);
          const remainingHours = hoursRemaining % 24;

          // Create human-readable format
          let timeRemainingFormatted = "";
          if (daysRemaining > 0) {
            timeRemainingFormatted = daysRemaining === 1 ? "1 day remaining" : `${daysRemaining} days remaining`;
          } else if (hoursRemaining > 0) {
            timeRemainingFormatted = hoursRemaining === 1 ? "1 hour remaining" : `${hoursRemaining} hours remaining`;
          } else {
            timeRemainingFormatted = "Less than 1 hour remaining";
          }

          return {
            ...item,
            roundsRemaining,
            hoursRemaining,
            daysRemaining,
            remainingHours,
            timeRemainingFormatted,
            estimatedAvailableDate: new Date(Date.now() + (hoursRemaining * 60 * 60 * 1000)).toISOString()
          };
        });

      // Filter completed stake transactions (withdrawRound <= currentRound)
      const completedStakeTransactions = unbondingLocks
        .filter((item: any) =>
          item.withdrawRound &&
          parseInt(item.withdrawRound, 10) <= parseInt(currentRoundId, 10)
        )
        .map((item: any) => ({
          ...item,
          roundsRemaining: 0,
          hoursRemaining: 0,
          daysRemaining: 0,
          remainingHours: 0,
          timeRemainingFormatted: "Available now",
          estimatedAvailableDate: "Available now"
        }));

      return {
        success: true,
        data: {
          pendingStakeTransactions,
          completedStakeTransactions,
          currentRound: currentRoundId
        }
      };
    } catch (error) {
      console.error("Error fetching delegator transactions:", error);
      return { success: false, error: "Failed to fetch delegator transactions" };
    }
  }

  // Get delegator rewards over rounds
  async getDelegatorRewards(delegatorAddress: string): Promise<{
    success: boolean,
    data?: {
      rewards: Array<{
        round: string,
        rewardTokens: string,
        delegate: string,
        timestamp: string,
        transactionHash: string
      }>
    },
    error?: string
  }> {
    const query = GET_EVENTS;

    try {
      const response = await this.client.request<{ transactions: any[] }>(query, {
        id: delegatorAddress.toLowerCase(),
      });
      
      if (!response.transactions || response.transactions.length === 0) {
        return { success: false, error: "No transactions found for this delegator" };
      }
      
      const rewards: Array<{
        round: string,
        rewardTokens: string,
        delegate: string,
        timestamp: string,
        transactionHash: string
      }> = [];

      // Extract reward events from transactions
      response.transactions.forEach((transaction: any) => {
        if (transaction.events) {
           console.log(transaction.events,"transaction.events")
          transaction.events.forEach((event: any) => {
            if (event.__typename === 'RewardEvent') {
              rewards.push({
                round: event.round?.id || 'Unknown',
                rewardTokens: event.rewardTokens || '0',
                delegate: event.delegate?.id || 'Unknown',
                timestamp: event.transaction?.timestamp || 'Unknown',
                transactionHash: event.transaction?.id || 'Unknown'
              });
            }
          });
        }
      });

      // Sort rewards by round (descending)
      rewards.sort((a, b) => parseInt(b.round, 10) - parseInt(a.round, 10));

      return {
        success: true,
        data: {
          rewards
        }
      };
    } catch (error) {
      console.error("Error fetching delegator rewards:", error);
      return { success: false, error: "Failed to fetch delegator rewards" };
    }
  }

  // Get stake profile for a delegator using bondingManager contract and subgraph data
  async getStakeProfile(delegatorAddress: string): Promise<{
    success: boolean,
    data?: {
      delegator: string,
      currentStake: string,
      lifetimeStaked: string,
      lifetimeUnbonded: string,
      lifetimeRewards: string
    },
    error?: string
  }> {
    try {
      // Get the RPC endpoint from environment
      const rpcUrl = arbitrumOne.rpcUrls.default.http[0];
      if (!rpcUrl) {
        return { success: false, error: "RPC URL not configured" };
      }

      // Create provider and contract instance
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const contract = new ethers.Contract(LIVEPEER_CONTRACTS.arbitrum.proxy, bondingManagerAbi, provider);
      
      // Get profile data from subgraph
      const profileQuery = GET_DELEGATOR_BY_ADDRESS_QUERY;
      const profileResponse = await this.client.request<{ delegator: any }>(profileQuery, { 
        address: delegatorAddress.toLowerCase() 
      });

      // Call pendingStake with endRound = 0 (current round)
      const pendingStakeResult = await contract.pendingStake(delegatorAddress, 0);
      
      // Convert from wei to ETH units
      const pendingStakeFormatted = ethers.formatEther(pendingStakeResult);

      // Calculate additional values
      const profileData = profileResponse;
      const lifetimeStaked = parseFloat(profileData?.delegator?.principal || '0');
      const lifetimeUnbonded = parseFloat(profileData?.delegator?.unbonded || '0');
      const currentStake = pendingStakeResult ? parseFloat(pendingStakeFormatted) : 0;
      const lifetimeRewards = (currentStake - lifetimeStaked) + lifetimeUnbonded;

      return {
        success: true,
        data: {
          delegator: delegatorAddress,
          currentStake: pendingStakeFormatted,
          lifetimeStaked: lifetimeStaked.toString(),
          lifetimeUnbonded: lifetimeUnbonded.toString(),
          lifetimeRewards: lifetimeRewards.toString()
        }
      };
    } catch (error) {
      console.error("Error fetching stake profile:", error);
      return { success: false, error: "Failed to fetch stake profile" };
    }
  }
}

export const delegationService = new DelegationService();
