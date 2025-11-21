import 'dotenv/config';
import { rewardsNotificationJob } from '../src/jobs/rewards-notification.job';

async function testRewardCalculation() {
  try {
    console.log('Testing reward calculation using actual RewardEvents from subgraph...\n');
    
    // Test with daily period
    console.log('=== Testing DAILY rewards ===');
    await rewardsNotificationJob.execute('daily');
    
    console.log('\n=== Testing WEEKLY rewards ===');
    await rewardsNotificationJob.execute('weekly');
    
    console.log('\n=== Testing MONTHLY rewards ===');
    await rewardsNotificationJob.execute('monthly');
    
    console.log('\n✅ Reward calculation test completed!');
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testRewardCalculation();
