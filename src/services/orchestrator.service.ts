import { GraphQLClient } from 'graphql-request';

export class OrchestratorService {
  private graphqlEndpoint: string;
  private client: GraphQLClient;
  private ensClient: GraphQLClient;

  constructor() {
    this.graphqlEndpoint = process.env.LIVEPEER_SUBGRAPH_URL || '';
    const apiKey = process.env.SUBGRAPH_API_KEY || '';
    this.client = new GraphQLClient(this.graphqlEndpoint, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    });

    // Initialize ENS client
    const ensEndpoint = process.env.ENS_SUBGRAPH_URL || '';
    this.ensClient = new GraphQLClient(ensEndpoint, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    });

  }

  async fetchENS(address: string): Promise<string | null> {
    try {
      const query = `
        query getENS($address: String!) {
          domains(where: { resolvedAddress: $address }, orderBy: createdAt, orderDirection: desc) {
            name
          }
        }
      `;
      const response = await this.ensClient.request<{ domains: { name: string }[] }>(query, { address });
      return response.domains?.[0]?.name || null;
    } catch (error) {
      console.error('Error fetching ENS domain:', error);
      return null;
    }
  }

  async fetchFromSubgraph(query: string, variables?: Record<string, any>): Promise<any> {
    try {
      const response = await this.client.request<{ transcoders: any[] }>(query, variables);
      const transcoders = response.transcoders || [];

      const storedENSNames: Record<string, string> = {};
      const ensPromises = transcoders.map(async (transcoder: any) => {
        if (!storedENSNames[transcoder.id]) {
          const ensName = await this.fetchENS(transcoder.id);
          storedENSNames[transcoder.id] = ensName || `${transcoder.id.slice(0, 6)}-${transcoder.id.slice(-6)}`;
        }
      });

      await Promise.all(ensPromises);

      const enhancedTranscoders = transcoders.map((transcoder: any) => ({
        address: transcoder.id,
        ensName: storedENSNames[transcoder.id],
        apy: '10%', // Placeholder value
        totalStake: transcoder.totalStake,
        totalVolumeETH: transcoder.totalVolumeETH,
        performance: 'Good', // Placeholder value
        fee: `${transcoder.feeShare}%`,
        reward: `${transcoder.rewardCut}%`,
        active: transcoder.active,
        description: 'Livepeer transcoder',
      }));

      return { success: true, data: enhancedTranscoders };
    } catch (error) {
      console.error('Error fetching from subgraph:', error);
      throw error;
    }
  }
}

export const orchestratorService = new OrchestratorService();
