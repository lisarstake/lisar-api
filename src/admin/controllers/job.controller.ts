import { Request, Response } from 'express';
import { jobScheduler } from '../../jobs/scheduler';
import { rewardsNotificationJob } from '../../jobs/rewards-notification.job';

export class JobController {
  /**
   * List all scheduled jobs
   * GET /admin/jobs
   */
  async listJobs(req: Request, res: Response): Promise<void> {
    try {
      // Return job list with status
      const jobs = [
        {
          name: 'daily-rewards',
          description: 'Daily rewards notification',
          schedule: process.env.DAILY_REWARDS_CRON || '0 9 * * *',
          status: jobScheduler.getJobStatus('daily-rewards')
        },
        {
          name: 'weekly-rewards',
          description: 'Weekly rewards notification',
          schedule: process.env.WEEKLY_REWARDS_CRON || '0 10 * * 1',
          status: jobScheduler.getJobStatus('weekly-rewards')
        },
        {
          name: 'monthly-rewards',
          description: 'Monthly rewards notification',
          schedule: process.env.MONTHLY_REWARDS_CRON || '0 11 1 * *',
          status: jobScheduler.getJobStatus('monthly-rewards')
        }
      ];

      res.status(200).json({
        success: true,
        data: {
          jobs,
          timezone: process.env.JOB_TIMEZONE || 'UTC',
          enabled: process.env.ENABLE_JOBS !== 'false'
        }
      });
    } catch (error: any) {
      console.error('Error in listJobs:', error);
      res.status(500).json({
        error: error.message || 'Failed to list jobs',
        success: false
      });
    }
  }

  /**
   * Manually trigger a job
   * POST /admin/jobs/:jobName/trigger
   */
  async triggerJob(req: Request, res: Response): Promise<void> {
    try {
      const { jobName } = req.params;

      if (!jobName) {
        res.status(400).json({
          error: 'Job name is required',
          success: false
        });
        return;
      }

      const result = await jobScheduler.triggerJob(jobName);

      if (!result.success) {
        res.status(400).json({
          error: result.message,
          success: false
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error: any) {
      console.error('Error in triggerJob:', error);
      res.status(500).json({
        error: error.message || 'Failed to trigger job',
        success: false
      });
    }
  }

  /**
   * Run a custom rewards notification
   * POST /admin/jobs/rewards/custom
   */
  async runCustomRewardsJob(req: Request, res: Response): Promise<void> {
    try {
      const { periodType } = req.body;

      if (!periodType || !['daily', 'weekly', 'monthly'].includes(periodType)) {
        res.status(400).json({
          error: 'Invalid period type. Must be one of: daily, weekly, monthly',
          success: false
        });
        return;
      }

      const result = await rewardsNotificationJob.runManual(periodType as 'daily' | 'weekly' | 'monthly');

      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error in runCustomRewardsJob:', error);
      res.status(500).json({
        error: error.message || 'Failed to run custom rewards job',
        success: false
      });
    }
  }

  /**
   * Stop a job
   * POST /admin/jobs/:jobName/stop
   */
  async stopJob(req: Request, res: Response): Promise<void> {
    try {
      const { jobName } = req.params;

      if (!jobName) {
        res.status(400).json({
          error: 'Job name is required',
          success: false
        });
        return;
      }

      jobScheduler.stopJob(jobName);

      res.status(200).json({
        success: true,
        message: `Job '${jobName}' stopped successfully`
      });
    } catch (error: any) {
      console.error('Error in stopJob:', error);
      res.status(500).json({
        error: error.message || 'Failed to stop job',
        success: false
      });
    }
  }

  /**
   * Start a job
   * POST /admin/jobs/:jobName/start
   */
  async startJob(req: Request, res: Response): Promise<void> {
    try {
      const { jobName } = req.params;

      if (!jobName) {
        res.status(400).json({
          error: 'Job name is required',
          success: false
        });
        return;
      }

      jobScheduler.startJob(jobName);

      res.status(200).json({
        success: true,
        message: `Job '${jobName}' started successfully`
      });
    } catch (error: any) {
      console.error('Error in startJob:', error);
      res.status(500).json({
        error: error.message || 'Failed to start job',
        success: false
      });
    }
  }
}

export const jobController = new JobController();
