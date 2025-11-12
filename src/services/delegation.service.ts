import { GraphQLClient } from 'graphql-request';
import { GET_DELEGATOR_BY_ADDRESS_QUERY, GET_ALL_DELEGATIONS_QUERY, GET_BOND_EVENTS_QUERY, GET_PENDING_REWARDS_QUERY, GET_PROFILE_INFO, GET_EVENTS } from '../queries/subgraph.queries';
import { protocolService } from './protocol.service';
import { ethers } from 'ethers';
import { arbitrumOne, LIVEPEER_CONTRACTS } from '../protocols/config/livepeer.config';
import bondingManagerAbi from '../protocols/abis/livepeer/bondingManager.abi.json';
import coinGeckoService from '../integrations/coingecko.service';

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
          const daysRemaining = withdrawRound - currentRound;

          // Create human-readable format
          let timeRemainingFormatted = "";
          if (daysRemaining > 1) {
            timeRemainingFormatted = `${daysRemaining} days remaining`;
          } else if (daysRemaining === 1) {
            timeRemainingFormatted = "1 day remaining";
          } else {
            timeRemainingFormatted = "Less than 1 day remaining";
          }

          return {
            ...item,
            roundsRemaining: daysRemaining,
            daysRemaining: daysRemaining,
            timeRemainingFormatted,
            estimatedAvailableDate: new Date(Date.now() + (daysRemaining * 24 * 60 * 60 * 1000)).toISOString()
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
          daysRemaining: 0,
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

  // Calculate yield/rewards based on amount, APY, and time period (generic calculation)
  async calculateYield(params: {
    amount: number;
    apy: number | string;
    period?: '1 day' | '1 week' | '1 month' | '6 months' | '1 year';
    includeCurrencyConversion?: boolean;
    // Input/display currency for amount and results. Supported: 'USD','NGN','GBP','LPT'
    currency?: 'USD' | 'NGN' | 'GBP' | 'LPT';
  }): Promise<{
     success: boolean;
     data?: {
       initialAmount: number;
       apy: number;
       marketValue?: {
         currency: string;
         lptPrice?: number;
         exchangeRate?: number;
       };
       periods: Array<{
         period: string;
         finalAmount: number;
         rewardAmount: number;
         compoundingPeriods: number;
         periodicRate: number;
         marketValue?: {
           finalMarketValue: number;
           rewardMarketValue: number;
         };
       }>;
     };
     error?: string;
   }> {
     try {
      const { amount, apy: apyInput, period, includeCurrencyConversion = false, currency = 'USD' } = params;

       // Parse APY - handle both string ("62%") and number formats
       let apy: number;
       if (typeof apyInput === 'string') {
         // Remove '%' and parse as number
         apy = parseFloat(apyInput.replace('%', ''));
       } else {
         apy = apyInput;
       }

       // Validate inputs
       if (amount <= 0) {
         return { success: false, error: "Amount must be greater than 0" };
       }
       if (apy <= 0) {
         return { success: false, error: "APY must be greater than 0" };
       }

       // Define all periods if none specified
       const allPeriods = ['1 day', '1 week', '1 month', '6 months', '1 year'] as const;
       const periodsToCalculate = period ? [period] : allPeriods;

       // Get market value info once if currency conversion is needed
      let marketValueInfo: { currency: string; lptPrice?: number; exchangeRate?: number } | undefined;
      const inputCurrency = (currency || 'USD').toUpperCase();
      
      // Always get LPT price when currency is specified or conversion is requested
      if (inputCurrency !== 'LPT') {
        try {
          const lptPrice = await coinGeckoService.getLPTPriceInCurrency(inputCurrency);
          const usdPrice = inputCurrency === 'USD' ? lptPrice : await coinGeckoService.getLPTPriceInCurrency('USD');
          const exchangeRate = inputCurrency === 'USD' ? undefined : lptPrice / usdPrice;
          marketValueInfo = { currency: inputCurrency, lptPrice, exchangeRate };
        } catch (convErr) {
          console.error('Currency conversion failed:', convErr);
          return { success: false, error: `Failed to fetch ${inputCurrency} price for LPT` };
        }
      }

       // Calculate yields for all specified periods
         const periods = periodsToCalculate.map(periodItem => {
         // Calculate compounding periods based on Livepeer's round duration (21 hours 40 minutes)
         const periodInDays = this.getPeriodInDays(periodItem);
         const compoundingPeriodDays = (21 + 40 / 60) / 24; // Convert to days
         const compoundingPeriods = periodInDays / compoundingPeriodDays;

         // Calculate periodic rate
         const annualRate = apy / 100;
         const periodicRate = Math.pow(1 + annualRate, compoundingPeriodDays / 365) - 1;

        // Determine principal in LPT units
        let principalLPT: number;
        if (inputCurrency === 'LPT') {
          principalLPT = amount;
        } else {
          const price = marketValueInfo?.lptPrice || 0;
          principalLPT = price > 0 ? amount / price : 0;
        }

        // Compute amounts in LPT then convert back to input/display currency
        const finalAmountLPT = principalLPT * Math.pow(1 + periodicRate, compoundingPeriods);
        const rewardAmountLPT = finalAmountLPT - principalLPT;
        
        // Convert to display currency
        let finalAmount: number;
        let rewardAmount: number;
        
        if (inputCurrency === 'LPT') {
          finalAmount = finalAmountLPT;
          rewardAmount = rewardAmountLPT;
        } else {
          const displayPrice = marketValueInfo!.lptPrice!;
          finalAmount = finalAmountLPT * displayPrice;
          rewardAmount = rewardAmountLPT * displayPrice;
        }

         const periodResult: any = {
           period: periodItem,
           finalAmount,
           rewardAmount,
           compoundingPeriods,
           periodicRate
         };

         // Add market value details for fiat currencies
         if (marketValueInfo) {
          periodResult.marketValue = {
            lptPrice: marketValueInfo.lptPrice,
            exchangeRate: marketValueInfo.exchangeRate,
            principalInLPT: principalLPT,
            finalAmountInLPT: finalAmountLPT,
            rewardAmountInLPT: rewardAmountLPT
          };
         }

         return periodResult;
       });

       return {
         success: true,
         data: {
          initialAmount: amount,
          apy,
          marketValue: marketValueInfo,
          periods
         }
       };
     } catch (error) {
       console.error("Error calculating yield:", error);
       return { success: false, error: "Failed to calculate yield" };
     }
   }

  // Helper method to convert period string to days
  private getPeriodInDays(period: string): number {
    const periodMap: { [key: string]: number } = {
      '1 day': 1,
      '1 week': 7,
      '1 month': 30,
      '6 months': 182.5,
      '1 year': 365,
    };
    return periodMap[period] || 0;
  }

  // Helper method to fetch current LPT price and calculate market values
  private async calculateMarketValue(
    initialAmount: number, 
    finalAmount: number, 
    currency: 'USD' | 'EUR' | 'GBP'
  ): Promise<{
    currency: string;
    lptPrice?: number;
    exchangeRate?: number;
    initialMarketValue: number;
    finalMarketValue: number;
    rewardMarketValue: number;
  }> {
    // Fetch LPT price from Binance
    let lptPrice: number | null = null;
    try {
      // Try Binance US first
      const responseUS = await fetch('https://api.binance.us/api/v3/ticker/price?symbol=LPTUSDT');
      if (responseUS.ok) {
        const dataUS = await responseUS.json() as { price: string };
        lptPrice = parseFloat(dataUS.price);
      } else {
        // Fallback to Binance.com
        const responseGlobal = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=LPTUSDT');
        if (responseGlobal.ok) {
          const dataGlobal = await responseGlobal.json() as { price: string };
          lptPrice = parseFloat(dataGlobal.price);
        }
      }
    } catch (error) {
      console.error('Failed to fetch LPT price:', error);
      throw new Error('Unable to fetch LPT price');
    }

    if (!lptPrice) {
      throw new Error('LPT price not available');
    }

    // Get exchange rate if not USD
    let exchangeRate = 1; // Default for USD
    if (currency !== 'USD') {
      try {
        const apiKey = process.env.EXCHANGE_RATE_API_KEY;
        if (!apiKey) {
          throw new Error('Exchange rate API key not configured');
        }

        const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`);
        if (response.ok) {
          const data = await response.json() as { 
            result: string; 
            conversion_rates: { [key: string]: number };
            'error-type'?: string;
          };
          if (data.result === 'success') {
            exchangeRate = data.conversion_rates[currency];
            if (!exchangeRate) {
              throw new Error(`Exchange rate for ${currency} not found`);
            }
          } else {
            throw new Error(`Exchange rate API error: ${data['error-type']}`);
          }
        } else {
          throw new Error('Failed to fetch exchange rates');
        }
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
        throw error;
      }
    }

    // Calculate market values
    const initialMarketValue = initialAmount * lptPrice * exchangeRate;
    const finalMarketValue = finalAmount * lptPrice * exchangeRate;
    const rewardMarketValue = finalMarketValue - initialMarketValue;

    return {
      currency,
      lptPrice,
      exchangeRate: currency !== 'USD' ? exchangeRate : undefined,
      initialMarketValue,
      finalMarketValue,
      rewardMarketValue
    };
  }
}

export const delegationService = new DelegationService();
