import { rewardsNotificationJob } from '../src/jobs/rewards-notification.job';
import { jobScheduler } from '../src/jobs/scheduler';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Test script for background jobs
 * 
 * Usage:
 * npm run test:jobs [daily|weekly|monthly]
 */

async function testRewardsJob() {
  const period = (process.argv[2] || 'daily') as 'daily' | 'weekly' | 'monthly';
  
  console.log('='.repeat(60));
  console.log(`Testing ${period} rewards notification job`);
  console.log('='.repeat(60));
  console.log();

  try {
    console.log(`[Test] Starting ${period} rewards calculation...`);
    console.log(`[Test] This will:`);
    console.log(`  1. Fetch all users with wallet addresses`);
    console.log(`  2. Calculate their rewards for the ${period} period`);
    console.log(`  3. Create notifications for users with rewards > 0`);
    console.log();

    const result = await rewardsNotificationJob.runManual(period);
    
    console.log();
    console.log('='.repeat(60));
    if (result.success) {
      console.log('✅ Test completed successfully!');
      console.log(`Message: ${result.message}`);
    } else {
      console.log('❌ Test failed!');
      console.log(`Error: ${result.message}`);
    }
    console.log('='.repeat(60));
    
    process.exit(result.success ? 0 : 1);
  } catch (error: any) {
    console.error();
    console.error('='.repeat(60));
    console.error('❌ Test failed with error:');
    console.error(error.message);
    console.error('='.repeat(60));
    process.exit(1);
  }
}

async function testScheduler() {
  console.log('='.repeat(60));
  console.log('Testing Job Scheduler');
  console.log('='.repeat(60));
  console.log();

  try {
    console.log('[Test] Starting scheduler...');
    jobScheduler.start();
    
    console.log();
    console.log('[Test] Scheduler is running. Jobs will execute at:');
    console.log(`  - Daily: ${process.env.DAILY_REWARDS_CRON || '0 9 * * *'} (9:00 AM daily)`);
    console.log(`  - Weekly: ${process.env.WEEKLY_REWARDS_CRON || '0 10 * * 1'} (10:00 AM Monday)`);
    console.log(`  - Monthly: ${process.env.MONTHLY_REWARDS_CRON || '0 11 1 * *'} (11:00 AM 1st of month)`);
    console.log(`  - Timezone: ${process.env.JOB_TIMEZONE || 'UTC'}`);
    console.log();
    console.log('[Test] Press Ctrl+C to stop the scheduler');
    
    // Keep the process running
    await new Promise(() => {});
  } catch (error: any) {
    console.error();
    console.error('❌ Scheduler test failed:');
    console.error(error.message);
    process.exit(1);
  }
}

// Check command line argument
const command = process.argv[2];

if (command === 'scheduler') {
  testScheduler();
} else {
  testRewardsJob();
}
