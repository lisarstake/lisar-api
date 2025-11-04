import { GraphQLClient } from 'graphql-request';
import { calculateROI, getMonthsForTimeHorizon } from '../utils/roi';
const orchestratorYieldData = require('../utils/orchestrator.json');

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

  /**
   * Get yield percentage from the static data for an orchestrator
   * Maps ENS names and abbreviated addresses to their yield values
   */
  private getOrchestratorYield(ensName: string | null, address: string): number | null {
    try {
      // Ensure we have the data as an array
      const yieldData = Array.isArray(orchestratorYieldData) ? orchestratorYieldData : [];
      
      if (yieldData.length === 0) {
        console.log('[DEBUG] No yield data loaded or empty array');
        return null;
      }
      
      console.log(`[DEBUG] Looking for yield data for address: ${address}, ENS: ${ensName}`);
      console.log(`[DEBUG] Available yield data entries: ${yieldData.length}`);
      
      // First, try to match by ENS name if available
      if (ensName && !ensName.startsWith('0x')) { // Only process real ENS names, not fallback addresses
        // Try exact match first
        console.log(`[DEBUG] Trying ENS exact match for: ${ensName}`);
        const exactMatch = yieldData.find(item => 
          item.name.toLowerCase() === ensName.toLowerCase()
        );
        if (exactMatch) {
          console.log(`[DEBUG] Found exact ENS match: ${exactMatch.name} -> ${exactMatch.yield}%`);
          return exactMatch.yield;
        }
        
        // Remove number prefixes from ENS name (e.g., "1day-dreamer.eth" -> "day-dreamer.eth")
        const cleanEnsName = ensName.replace(/^\d+/, '');
        console.log(`[DEBUG] Trying cleaned ENS match for: ${cleanEnsName}`);
        const cleanedMatch = yieldData.find(item => 
          item.name.toLowerCase() === cleanEnsName.toLowerCase()
        );
        if (cleanedMatch) {
          console.log(`[DEBUG] Found cleaned ENS match: ${cleanedMatch.name} -> ${cleanedMatch.yield}%`);
          return cleanedMatch.yield;
        }
        
        // Try partial matches as fallback
        const partialMatch = yieldData.find(item => 
          item.name.toLowerCase().includes(cleanEnsName.toLowerCase()) ||
          cleanEnsName.toLowerCase().includes(item.name.toLowerCase())
        );
        if (partialMatch) {
          console.log(`[DEBUG] Found partial ENS match: ${partialMatch.name} -> ${partialMatch.yield}%`);
          return partialMatch.yield;
        }
      }
      
      // Try to match by abbreviated address format
      const addressStart = address.slice(0, 6).toLowerCase();
      const addressEnd = address.slice(-6).toLowerCase();
      const abbreviatedPattern = `${addressStart}...${addressEnd}`;
      
      console.log(`[DEBUG] Trying address pattern match: ${abbreviatedPattern}`);
      
      const addressMatch = yieldData.find(item => {
        const itemName = item.name.toLowerCase();
        const isExactMatch = itemName === abbreviatedPattern;
        const containsStart = itemName.includes(addressStart);
        const isFullMatch = itemName.startsWith('0x') && 
                           itemName.includes(addressStart.slice(2)) && 
                           itemName.includes(addressEnd);
        
        if (itemName.startsWith('0x')) {
          console.log(`[DEBUG] Checking address ${item.name}: exact=${isExactMatch}, containsStart=${containsStart}, fullMatch=${isFullMatch}`);
        }
        
        return isExactMatch || containsStart || isFullMatch;
      });
      
      if (addressMatch) {
        console.log(`[DEBUG] Found address match: ${addressMatch.name} -> ${addressMatch.yield}%`);
        return addressMatch.yield;
      }
      
      console.log(`[DEBUG] No match found for ${address} / ${ensName}`);
      return null; // No match found
    } catch (error) {
      console.error('Error getting orchestrator yield:', error);
      console.error('orchestratorYieldData type:', typeof orchestratorYieldData);
      console.error('orchestratorYieldData isArray:', Array.isArray(orchestratorYieldData));
      return null;
    }
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

      // Filter for active transcoders only as an additional safeguard
      transcoders = transcoders.filter(transcoder => transcoder.active === true);

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
        const ensName = storedENSNames[transcoder.id];
        
        // Get yield from static data or fallback to calculated APY
        const yieldFromData = this.getOrchestratorYield(ensName, transcoder.id);
        console.log(`[DEBUG] Transcoder ${transcoder.id} (${ensName}): yieldFromData = ${yieldFromData}`);
        const apy = yieldFromData !== null ? yieldFromData : this.calculateAPY(transcoder.rewardCut);
        
        return {
          address: transcoder.id,
          ensName,
          apy,
          totalStake: parseFloat(transcoder.totalStake),
          totalVolumeETH: parseFloat(transcoder.totalVolumeETH),
          performance: this.calculatePerformance(transcoder),
          fee: parseFloat(transcoder.feeShare),
          reward: parseFloat(transcoder.rewardCut),
          active: transcoder.active,
          activeSince: transcoder.activationTimestamp,
          description: 'Livepeer transcoder',
          yieldSource: yieldFromData !== null ? 'static_data' : 'calculated'
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

      // Sort results - robust comparator
      const sortComparator = (a: any, b: any, sortBy?: string, sortOrder?: 'asc' | 'desc') => {
        const order = sortOrder === 'asc' ? 1 : -1; // default desc

        // If explicit sortBy provided
        if (sortBy) {
          if (sortBy === 'activeSince') {
            return order * (new Date(a.activeSince).getTime() - new Date(b.activeSince).getTime());
          }

          // numeric fields
          const numericFields = ['apy', 'totalStake', 'totalVolumeETH', 'fee', 'reward'];
          if (numericFields.includes(sortBy)) {
            const valA = Number(a[sortBy]) || 0;
            const valB = Number(b[sortBy]) || 0;
            return order * (valA - valB);
          }

          // fallback to string comparison
          const strA = (a[sortBy] || '').toString();
          const strB = (b[sortBy] || '').toString();
          return order * strA.localeCompare(strB);
        }

        // Default: sort by apy descending
        const apyA = Number(a.apy) || 0;
        const apyB = Number(b.apy) || 0;
        return apyB - apyA;
      };

      if (params?.sortBy) {
        enhancedTranscoders.sort((a, b) => sortComparator(a, b, params.sortBy, params.sortOrder));
      } else {
        enhancedTranscoders.sort((a, b) => sortComparator(a, b));
      }

      console.log(`[DEBUG] Top 3 after sorting:`, enhancedTranscoders.slice(0, 3).map(t => ({
        name: t.ensName || t.address.slice(0, 8),
        apy: t.apy,
        type: typeof t.apy
      })));

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
   * Returns APY from static yield data or falls back to calculated value.
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
          }
        }
      `;

      const resp = await this.client.request<any>(query, { id: id.toLowerCase() });
      const t = resp?.transcoders?.[0];
      if (!t) {
        throw new Error('Orchestrator not found');
      }

      // Get ENS name for better matching
      const ensName = await this.fetchENS(t.id);
      
      // Try to get yield from static data first
      const yieldFromData = this.getOrchestratorYield(ensName, t.id);
      
      if (yieldFromData !== null) {
        // Return static yield data directly
        return {
          apyPercent: yieldFromData,
          roi: {
            delegatorPercent: {
              rewards: yieldFromData / 100,
              fees: 0
            }
          },
          inputsUsed: { 
            source: 'static_yield_data',
            ensName: ensName || 'none',
            address: t.id,
            yieldValue: yieldFromData
          }
        };
      }

      // Fallback to simple calculated APY if no static data found
      const calculatedApy = this.calculateAPY(t.rewardCut);
      
      return {
        apyPercent: calculatedApy,
        roi: {
          delegatorPercent: {
            rewards: calculatedApy / 100,
            fees: 0
          }
        },
        inputsUsed: { 
          source: 'calculated_fallback',
          ensName: ensName || 'none',
          address: t.id,
          rewardCut: t.rewardCut
        }
      };
    } catch (err) {
      console.error('calculateApyFor error:', err);
      throw err;
    }
  }
}

export const orchestratorService = new OrchestratorService();
