import { JsonRpcProvider } from 'ethers';

export const DEFAULT_AVERAGE_L1_BLOCK_TIME = Number(process.env.AVERAGE_L1_BLOCK_TIME_SECONDS) || 12;
export const AVERAGE_L1_BLOCK_TIME = DEFAULT_AVERAGE_L1_BLOCK_TIME;

/**
 * Compute average block time (seconds) by sampling recent blocks from the configured RPC.
 * Falls back to DEFAULT_AVERAGE_L1_BLOCK_TIME if RPC or blocks cannot be fetched.
 */
export async function getAverageBlockTime(sample = 20): Promise<number> {
  const rpcUrl = process.env.RPC_URL || process.env.ALCHEMY_URL || process.env.INFURA_URL;
  if (!rpcUrl) return DEFAULT_AVERAGE_L1_BLOCK_TIME;

  try {
    const provider = new JsonRpcProvider(rpcUrl);
    const latest = await provider.getBlockNumber();
    const count = Math.min(sample, Math.max(0, latest - 1));
    if (count <= 0) return DEFAULT_AVERAGE_L1_BLOCK_TIME;

    const blockPromises: Array<Promise<any>> = [];
    for (let i = 0; i <= count; i++) {
      blockPromises.push(provider.getBlock(latest - i));
    }

    const blocks = await Promise.all(blockPromises);
    const timestamps = blocks.map((b: any) => (b?.timestamp ?? 0)).filter(Boolean) as number[];
    if (timestamps.length < 2) return DEFAULT_AVERAGE_L1_BLOCK_TIME;

    let totalDelta = 0;
    for (let i = 0; i < timestamps.length - 1; i++) {
      totalDelta += timestamps[i] - timestamps[i + 1];
    }

    return totalDelta / (timestamps.length - 1);
  } catch (err) {
    console.warn('getAverageBlockTime failed, falling back to default:', err);
    return DEFAULT_AVERAGE_L1_BLOCK_TIME;
  }
}
