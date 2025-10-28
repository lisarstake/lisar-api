import { GraphQLClient } from 'graphql-request';
import { arbitrumOne, LIVEPEER_CONTRACTS } from '../protocols/config/livepeer.config';
import { ethers } from 'ethers';
import roundManagerAbi from '../protocols/abis/livepeer/roundManager.abi.json';
import { getAverageBlockTime, DEFAULT_AVERAGE_L1_BLOCK_TIME } from '../utils/blockTime';

export class ProtocolService {
    public l1Provider: any = null;
    public l2Provider: any = null;
    private roundManager: any = null; // ethers.Contract

    constructor() {
        const l1Rpc = process.env.RPC_URL || ''
        const l2Rpc = arbitrumOne?.rpcUrls?.default?.http?.[0] || '';

        this.l1Provider = this.createProvider(l1Rpc);
        this.l2Provider = this.createProvider(l2Rpc);

        this.initRoundManager();
    }

    // Helper to create a JsonRpcProvider that works across ethers v5/v6
    private createProvider(rpcUrl: string): any {
        if (!rpcUrl) return null;
        try {
            if ((ethers as any).JsonRpcProvider) return new (ethers as any).JsonRpcProvider(rpcUrl);
            if ((ethers as any).providers && (ethers as any).providers.JsonRpcProvider) return new (ethers as any).providers.JsonRpcProvider(rpcUrl);
            if ((ethers as any).getDefaultProvider) return (ethers as any).getDefaultProvider(rpcUrl);
        } catch (err) {
            console.warn('ProtocolService.createProvider failed for', rpcUrl, err);
        }
        return null;
    }

    private initRoundManager() {
        const rmAddress = LIVEPEER_CONTRACTS?.arbitrum?.roundManager;
        if (!rmAddress) return;
        if (!this.l2Provider) {
            console.warn('ProtocolService: l2Provider not configured; cannot init roundManager');
            return;
        }

        try {
            // instantiate contract using whatever ethers version is available
            this.roundManager = new (ethers as any).Contract(rmAddress, roundManagerAbi as any, this.l2Provider);
        } catch (err) {
            console.warn('ProtocolService: failed to init roundManager contract', err);
            this.roundManager = null;
        }
    }

    getL1Provider() {
        return this.l1Provider;
    }

    getL2Provider() {
        return this.l2Provider;
    }

    getRoundManager() {
        return this.roundManager;
    }

    async getLatestBlockFrom(provider: any): Promise<number> {
        if (!provider) throw new Error('provider not configured');
        const bn: any = await provider.getBlockNumber();
        return Number(bn);
    }

    // Read on-chain values from RoundManager
    async getRoundManagerState(): Promise<{ currentRound: number; roundLength: number; startBlock: number; initialized: boolean }> {
        if (!this.roundManager) throw new Error('roundManager not initialized');

        const rm = this.roundManager;
        const calls: Promise<any>[] = [rm.currentRound(), rm.roundLength(), rm.currentRoundStartBlock()];
        if (typeof rm.currentRoundInitialized === 'function') calls.push(rm.currentRoundInitialized());

        const results = await Promise.all(calls);

        const currentRound = +Number(results[0]);
        const roundLength = +Number(results[1]);
        const startBlock = +Number(results[2]);
        const initialized = results.length > 3 ? Boolean(results[3]) : true;

        return { currentRound, roundLength, startBlock, initialized };
    }

    // High-level status: use L1 (Ethereum) block number to compute when current round will end
    async getStatus(): Promise<{ currentRound: number; roundLength: number;  startBlock: number; blocksIntoRound: number; initialized: boolean; currentL1Block: number; blocksRemaining: number; estimatedNextRoundAt: number; estimatedHours: number; estimatedHoursRounded: number; estimatedHoursHuman: string }> {
        if (!this.roundManager) throw new Error('roundManager not initialized');
        if (!this.l1Provider) throw new Error('L1 provider not configured');

        const { currentRound, roundLength, startBlock, initialized } = await this.getRoundManagerState();

        const currentL1Block = await this.getLatestBlockFrom(this.l1Provider);
        const blocksIntoRound = Math.max(0, currentL1Block - startBlock);
        const blocksRemaining = initialized && roundLength ? Math.max(0, roundLength - (currentL1Block - startBlock)) : 0;
        const blocksUntilNextRound = blocksRemaining; // alias to match previous name
        const nextRoundBlock = currentL1Block + blocksUntilNextRound;

        // Compute time remaining using default average L1 block time (don't sample RPC)
        const avgBlockTime = DEFAULT_AVERAGE_L1_BLOCK_TIME;
        const secondsRemaining = Math.round(avgBlockTime * blocksRemaining);
        const estimatedNextRoundAt = Math.floor(Date.now() / 1000) + secondsRemaining;

        // Hours estimation
        const hours = secondsRemaining / 3600;
        const estimatedHours = Number(hours.toFixed(1)); // one decimal
        const estimatedHoursRounded = Math.max(0, Math.round(hours));
        const estimatedHoursHuman = estimatedHoursRounded === 1 ? '1 hour' : `${estimatedHoursRounded} hours`;

        return { currentRound, currentL1Block, roundLength, blocksRemaining,  estimatedNextRoundAt,  startBlock, blocksIntoRound, initialized, estimatedHours, estimatedHoursRounded, estimatedHoursHuman };
    }
}

export const protocolService = new ProtocolService();
