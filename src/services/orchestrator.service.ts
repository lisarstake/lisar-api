import { GraphQLClient } from 'graphql-request';
import { calculateROI, getMonthsForTimeHorizon } from '../utils/roi';

interface QueryParams {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  filters: {
    minApy?: number;
    maxApy?: number;
    minStake?: number;
    maxStake?: number;
    active?: boolean;
  };
}

interface Transcoder {
  id: string;
  totalStake: string;
  totalVolumeETH: string;
  feeShare: string;
  rewardCut: string;
  active: boolean;
  activationTimestamp: string;
}

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

    const ensEndpoint = process.env.ENS_SUBGRAPH_URL || '';
    this.ensClient = new GraphQLClient(ensEndpoint, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    });
  }

  private calculatePerformance(transcoder: Transcoder): string {
    const stake = parseFloat(transcoder.totalStake);
    const volume = parseFloat(transcoder.totalVolumeETH);
    
    if (stake > 1000000 && volume > 1000) return 'Excellent';
    if (stake > 500000 && volume > 500) return 'Very Good';
    if (stake > 100000 && volume > 100) return 'Good';
    return 'Average';
  }

  private calculateAPY(rewardCut: string): number {
    return (100 - parseFloat(rewardCut)) * 0.15; // 15% base APY minus the reward cut
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

  async fetchFromSubgraph(query: string, params?: QueryParams): Promise<any> {
    try {
      const response = await this.client.request<{ transcoders: Transcoder[] }>(query);
      let transcoders = response.transcoders || [];

      // Fetch ENS names in parallel
      const storedENSNames: Record<string, string> = {};
      const ensPromises = transcoders.map(async (transcoder) => {
        if (!storedENSNames[transcoder.id]) {
          const ensName = await this.fetchENS(transcoder.id);
          storedENSNames[transcoder.id] = ensName || `${transcoder.id.slice(0, 6)}-${transcoder.id.slice(-6)}`;
        }
      });

      await Promise.all(ensPromises);

      // Transform and enhance data
      let enhancedTranscoders = transcoders.map((transcoder) => {
        const apy = this.calculateAPY(transcoder.rewardCut);
        return {
          address: transcoder.id,
          ensName: storedENSNames[transcoder.id],
          apy,
          totalStake: parseFloat(transcoder.totalStake),
          totalVolumeETH: parseFloat(transcoder.totalVolumeETH),
          performance: this.calculatePerformance(transcoder),
          fee: parseFloat(transcoder.feeShare),
          reward: parseFloat(transcoder.rewardCut),
          active: transcoder.active,
          activeSince: transcoder.activationTimestamp,
          description: 'Livepeer transcoder',
        };
      });

      // Apply filters if provided
      if (params?.filters) {
        enhancedTranscoders = enhancedTranscoders.filter(t => {
          if (params.filters.minApy && t.apy < params.filters.minApy) return false;
          if (params.filters.maxApy && t.apy > params.filters.maxApy) return false;
          if (params.filters.minStake && t.totalStake < params.filters.minStake) return false;
          if (params.filters.maxStake && t.totalStake > params.filters.maxStake) return false;
          if (params.filters.active !== undefined && t.active !== params.filters.active) return false;
          return true;
        });
      }

      // Sort results
      if (params?.sortBy) {
        enhancedTranscoders.sort((a: any, b: any) => {
          const multiplier = params.sortOrder === 'desc' ? -1 : 1;
          if (params.sortBy === 'activeSince') {
            return multiplier * (new Date(a.activeSince).getTime() - new Date(b.activeSince).getTime());
          }
          return multiplier * (a[params.sortBy] - b[params.sortBy]);
        });
      }

      // Apply pagination
      const total = enhancedTranscoders.length;
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedTranscoders = enhancedTranscoders.slice(start, end);

      return {
        data: paginatedTranscoders,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error fetching from subgraph:', error);
      throw error;
    }
  }

  /**
   * Calculate APY for a single orchestrator (transcoder) by id.
   * Returns computed apyPercent (annualized percent) and the raw ROI object.
   */
  async calculateApyFor(id: string, options?: { principle?: number; timeHorizon?: string; inflationChange?: string; factors?: string }) {
    try {
      const query = `
        query getTranscoder($id: ID!) {
          transcoders(where: { id: $id }) {
            id
            totalStake
            totalVolumeETH
            feeShare
            rewardCut
            active
            activationTimestamp
            pools {
              id
              rewardTokens
            }
          }
        }
      `;

      const resp = await this.client.request<any>(query, { id: id.toLowerCase() });
      const t = resp?.transcoders?.[0];
      if (!t) {
        throw new Error('Orchestrator not found');
      }

      const pools = t.pools || [];
      const rewardCalls = pools.length > 0 ? pools.filter((p: any) => p?.rewardTokens && p.rewardTokens.length > 0).length : 0;
      const rewardCallRatio = pools.length > 0 ? rewardCalls / pools.length : 0;

      const totalStakeNum = parseFloat(t.totalStake) || 0;
      const totalVolume = parseFloat(t.totalVolumeETH) || 0;

      let feeShareNum = parseFloat(t.feeShare) || 0;
      if (feeShareNum > 1) feeShareNum = feeShareNum / 100; // percent -> fraction

      let rewardCutNum = parseFloat(t.rewardCut) || 0;
      if (rewardCutNum > 1) rewardCutNum = rewardCutNum / 100;

      const feeParams = {
        ninetyDayVolumeETH: totalVolume,
        feeShare: feeShareNum,
        lptPriceEth: parseFloat(process.env.LPT_PRICE_ETH || '0.01')
      };

      const rewardParams = {
        inflation: parseFloat(process.env.ROI_INFLATION || '0.016'),
        inflationChangePerRound: parseFloat(process.env.ROI_INFLATION_CHANGE_PER_ROUND || '0'),
        totalSupply: parseFloat(process.env.ROI_TOTAL_SUPPLY || '100000000'),
        totalActiveStake: parseFloat(process.env.ROI_TOTAL_ACTIVE_STAKE || '50000000'),
        roundLength: parseInt(process.env.ROI_ROUND_LENGTH || '240', 10),
        averageL1BlockTime: undefined,
        rewardCallRatio,
        rewardCut: rewardCutNum,
        treasuryRewardCut: parseFloat(process.env.ROI_TREASURY_REWARD_CUT || '0.1')
      };

      const inputs = {
        principle: options?.principle ?? 1,
        timeHorizon: (options?.timeHorizon as any) ?? 'one-year',
        inflationChange: (options?.inflationChange as any) ?? 'none',
        factors: (options?.factors as any) ?? 'lpt+eth'
      };

      const roi = await calculateROI({
        inputs,
        orchestratorParams: { totalStake: totalStakeNum },
        feeParams,
        rewardParams
      } as any);

      const months = getMonthsForTimeHorizon(inputs.timeHorizon as any);
      const totalFraction = (roi.delegatorPercent.rewards || 0) + (roi.delegatorPercent.fees || 0);
      const annualized = months === 12 ? totalFraction : Math.pow(1 + totalFraction, 12 / months) - 1;
      const apyPercent = Number((annualized * 100).toFixed(2));

      return {
        apyPercent,
        roi,
        inputsUsed: { inputs, feeParams, rewardParams, totalStake: totalStakeNum }
      };
    } catch (err) {
      console.error('calculateApyFor error:', err);
      throw err;
    }
  }
}

export const orchestratorService = new OrchestratorService();
