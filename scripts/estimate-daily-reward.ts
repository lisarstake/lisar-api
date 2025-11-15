#!/usr/bin/env -S npx ts-node

import { rewardsNotificationJob } from '../src/jobs/rewards-notification.job';

// Support both daily and weekly estimation from CLI
async function main() {
  const [,, wallet, periodArg] = process.argv;
  if (!wallet) {
    console.error('Usage: npx ts-node scripts/estimate-daily-reward.ts <walletAddress> [daily|weekly]');
    process.exit(1);
  }
  const periodType = (periodArg === 'weekly') ? 'weekly' : 'daily';
  const result = await rewardsNotificationJob['estimateRewardForDelegator'](wallet, periodType);
  if (!result) {
    console.log(`No ${periodType} reward estimate available for`, wallet);
  } else {
    console.log(`Estimate for ${wallet} (${periodType}):`);
    console.dir(result, { depth: 5 });
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
