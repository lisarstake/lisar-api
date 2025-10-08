import { GraphQLClient } from 'graphql-request';
import { GET_DELEGATOR_BY_ADDRESS_QUERY, GET_ALL_DELEGATIONS_QUERY, GET_BOND_EVENTS_QUERY, GET_PENDING_REWARDS_QUERY } from '../queries/subgraph.queries';

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
  async getPendingRewards(delegatorAddress: string, transcoderAddress: string): Promise<{success: boolean, rewards?: string, error?: string}> {
    const query = GET_PENDING_REWARDS_QUERY;

    try {
      const response = await this.client.request<{ delegator: any }>(query, {
        delegator: delegatorAddress.toLowerCase(),
        transcoder: transcoderAddress.toLowerCase(),
      });

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
}

export const delegationService = new DelegationService();
