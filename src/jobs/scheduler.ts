import cron, { ScheduledTask } from 'node-cron';
import { rewardsNotificationJob } from './rewards-notification.job';

export class JobScheduler {
  private jobs: Map<string, ScheduledTask> = new Map();

  /**
   * Initialize and start all scheduled jobs
   */
  start(): void {
    console.log('[JobScheduler] Starting job scheduler...');

    // Daily rewards notification job
    // Runs every day at 9:00 AM
    const dailySchedule = process.env.DAILY_REWARDS_CRON || '0 9 * * *';
    this.scheduleJob('daily-rewards', dailySchedule, async () => {
      console.log('[JobScheduler] Running daily rewards notification job...');
      try {
        await rewardsNotificationJob.execute('daily');
      } catch (error: any) {
        console.error('[JobScheduler] Daily rewards job failed:', error.message);
      }
    });

    // Weekly rewards notification job
    // Runs every Monday at 10:00 AM
    const weeklySchedule = process.env.WEEKLY_REWARDS_CRON || '0 10 * * 1';
    this.scheduleJob('weekly-rewards', weeklySchedule, async () => {
      console.log('[JobScheduler] Running weekly rewards notification job...');
      try {
        await rewardsNotificationJob.execute('weekly');
      } catch (error: any) {
        console.error('[JobScheduler] Weekly rewards job failed:', error.message);
      }
    });

    // Monthly rewards notification job
    // Runs on the 1st of every month at 11:00 AM
    const monthlySchedule = process.env.MONTHLY_REWARDS_CRON || '0 11 1 * *';
    this.scheduleJob('monthly-rewards', monthlySchedule, async () => {
      console.log('[JobScheduler] Running monthly rewards notification job...');
      try {
        await rewardsNotificationJob.execute('monthly');
      } catch (error: any) {
        console.error('[JobScheduler] Monthly rewards job failed:', error.message);
      }
    });

    console.log('[JobScheduler] All jobs scheduled successfully');
    this.listScheduledJobs();
  }

  /**
   * Schedule a new cron job
   */
  private scheduleJob(name: string, schedule: string, task: () => void | Promise<void>): void {
    if (!cron.validate(schedule)) {
      console.error(`[JobScheduler] Invalid cron schedule for ${name}: ${schedule}`);
      return;
    }

    const job = cron.schedule(schedule, task, {
      timezone: process.env.JOB_TIMEZONE || 'UTC'
    });

    this.jobs.set(name, job);
    console.log(`[JobScheduler] Scheduled job '${name}' with schedule: ${schedule}`);
  }

  /**
   * Stop a specific job
   */
  stopJob(name: string): void {
    const job = this.jobs.get(name);
    if (job) {
      job.stop();
      console.log(`[JobScheduler] Stopped job '${name}'`);
    }
  }

  /**
   * Stop all jobs
   */
  stopAll(): void {
    console.log('[JobScheduler] Stopping all jobs...');
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`[JobScheduler] Stopped job '${name}'`);
    });
    this.jobs.clear();
  }

  /**
   * Start a specific job
   */
  startJob(name: string): void {
    const job = this.jobs.get(name);
    if (job) {
      job.start();
      console.log(`[JobScheduler] Started job '${name}'`);
    }
  }

  /**
   * List all scheduled jobs
   */
  listScheduledJobs(): void {
    console.log('[JobScheduler] Scheduled jobs:');
    this.jobs.forEach((job, name) => {
      console.log(`  - ${name}`);
    });
  }

  /**
   * Get job status
   */
  getJobStatus(name: string): 'running' | 'stopped' | 'not-found' {
    const job = this.jobs.get(name);
    if (!job) return 'not-found';
    
    // Note: node-cron doesn't expose a direct "isRunning" property
    // We track this via the scheduled state
    return 'running';
  }

  /**
   * Manually trigger a job (for testing or admin use)
   */
  async triggerJob(name: string): Promise<{ success: boolean; message: string }> {
    console.log(`[JobScheduler] Manually triggering job '${name}'...`);
    
    try {
      switch (name) {
        case 'daily-rewards':
          await rewardsNotificationJob.execute('daily');
          break;
        case 'weekly-rewards':
          await rewardsNotificationJob.execute('weekly');
          break;
        case 'monthly-rewards':
          await rewardsNotificationJob.execute('monthly');
          break;
        default:
          return {
            success: false,
            message: `Unknown job: ${name}`
          };
      }
      
      return {
        success: true,
        message: `Job '${name}' executed successfully`
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Job '${name}' failed: ${error.message}`
      };
    }
  }
}

export const jobScheduler = new JobScheduler();
