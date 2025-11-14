import { Router } from 'express';
import { jobsController } from '../controllers/jobs.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Admin - Jobs
 *   description: Background job management endpoints (Admin only)
 */

/**
 * @swagger
 * /admin/jobs:
 *   get:
 *     summary: Get list of all scheduled jobs
 *     tags: [Admin - Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of scheduled jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     jobs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *                           schedule:
 *                             type: string
 *                           status:
 *                             type: string
 *                     timezone:
 *                       type: string
 *                     enabled:
 *                       type: boolean
 */
router.get('/', jobsController.listJobs.bind(jobsController));

/**
 * @swagger
 * /admin/jobs/test:
 *   post:
 *     summary: Test a job with custom period
 *     tags: [Admin - Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - period
 *             properties:
 *               period:
 *                 type: string
 *                 enum: [daily, weekly, monthly]
 *                 example: daily
 *     responses:
 *       200:
 *         description: Job tested successfully
 *       400:
 *         description: Invalid period
 *       500:
 *         description: Job test failed
 */
router.post('/test', jobsController.testJob.bind(jobsController));

/**
 * @swagger
 * /admin/jobs/{jobName}/trigger:
 *   post:
 *     summary: Manually trigger a job
 *     tags: [Admin - Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobName
 *         required: true
 *         schema:
 *           type: string
 *           enum: [daily-rewards, weekly-rewards, monthly-rewards]
 *         description: Name of the job to trigger
 *     responses:
 *       200:
 *         description: Job triggered successfully
 *       400:
 *         description: Invalid job name
 *       500:
 *         description: Job failed
 */
router.post('/:jobName/trigger', jobsController.triggerJob.bind(jobsController));

/**
 * @swagger
 * /admin/jobs/{jobName}/stop:
 *   post:
 *     summary: Stop a scheduled job
 *     tags: [Admin - Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the job to stop
 *     responses:
 *       200:
 *         description: Job stopped successfully
 *       500:
 *         description: Failed to stop job
 */
router.post('/:jobName/stop', jobsController.stopJob.bind(jobsController));

/**
 * @swagger
 * /admin/jobs/{jobName}/start:
 *   post:
 *     summary: Start a scheduled job
 *     tags: [Admin - Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the job to start
 *     responses:
 *       200:
 *         description: Job started successfully
 *       500:
 *         description: Failed to start job
 */
router.post('/:jobName/start', jobsController.startJob.bind(jobsController));

export default router;
