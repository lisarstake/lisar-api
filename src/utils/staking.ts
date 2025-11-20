export const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';

export type Transcoder = { id: string; totalStake: string };

export type Hint = { newPosPrev: string; newPosNext: string };

export const getHint = (id: string, transcoders: Transcoder[] = []): Hint => {
  const hint: Hint = { newPosPrev: EMPTY_ADDRESS, newPosNext: EMPTY_ADDRESS };
  if (!transcoders?.length || !id) return hint;
  const index = transcoders.findIndex(t => (t.id || '').toLowerCase() === id.toLowerCase());
  if (index < 0 || transcoders.length < 2) return hint;
  if (index === 0) {
    hint.newPosNext = transcoders[index + 1].id;
  } else if (index === transcoders.length - 1) {
    hint.newPosPrev = transcoders[index - 1].id;
  } else {
    hint.newPosNext = transcoders[index + 1].id;
    hint.newPosPrev = transcoders[index - 1].id;
  }
  return hint;
};

/**
 * Simulate a new active set order after delegating/undelegating an amount.
 * - action: 'delegate' or 'undelegate'
 * - transcoders: array of { id, totalStake } where totalStake is a decimal string
 * - amount: BigNumber (wei)
 * - newDelegate: id that receives stake
 * - oldDelegate: optional id to subtract stake from
 */
export const simulateNewActiveSetOrder = ({
  action,
  transcoders,
  amount,
  newDelegate,
  oldDelegate = EMPTY_ADDRESS,
}: {
  action: 'delegate' | 'undelegate';
  transcoders: Transcoder[];
  amount: any;
  newDelegate: string;
  oldDelegate?: string;
}) => {
  // Defensive copy
  const updated = transcoders.map(t => ({ ...t }));

  const index = updated.findIndex(t => (t.id || '').toLowerCase() === newDelegate.toLowerCase());
  if (index < 0) return updated;

  const amountWei = amount.toBigInt();

  const stakeToWei = (s: string) => {
    try {
      // assume stake string is in ether units; convert by splitting decimals
      const [whole, frac] = (s || '0').split('.');
      const wholeWei = BigInt(whole || '0') * BigInt(1e18);
      const fracPadded = (frac || '').padEnd(18, '0').slice(0, 18);
      const fracWei = BigInt(fracPadded || '0');
      return wholeWei + fracWei;
    } catch {
      return BigInt(0);
    }
  };

  const weiToDecimalString = (wei: bigint) => {
    const whole = wei / BigInt(1e18);
    const frac = wei % BigInt(1e18);
    if (frac === BigInt(0)) return whole.toString();
    const fracStr = frac.toString().padStart(18, '0').replace(/0+$/, '');
    return `${whole.toString()}.${fracStr}`;
  };

  const currentWei = stakeToWei(updated[index].totalStake || '0');
  let newWei = action === 'delegate' ? currentWei + amountWei : (currentWei >= amountWei ? currentWei - amountWei : BigInt(0));
  updated[index].totalStake = weiToDecimalString(newWei);

  if (action === 'delegate' && oldDelegate && oldDelegate.toLowerCase() !== newDelegate.toLowerCase() && oldDelegate.toLowerCase() !== EMPTY_ADDRESS) {
    const oldIndex = updated.findIndex(t => (t.id || '').toLowerCase() === oldDelegate.toLowerCase());
    if (oldIndex !== -1) {
      const oldWei = stakeToWei(updated[oldIndex].totalStake || '0');
      const sub = oldWei >= amountWei ? oldWei - amountWei : BigInt(0);
      updated[oldIndex].totalStake = weiToDecimalString(sub);
    }
  }

  // Sort descending by totalStake
  updated.sort((a, b) => {
    const aVal = parseFloat(a.totalStake || '0');
    const bVal = parseFloat(b.totalStake || '0');
    return bVal - aVal;
  });

  return updated;
};

export default { getHint, simulateNewActiveSetOrder };
