import { Router } from 'express';
import { jobController } from '../controllers/job.controller';

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
 *     summary: List all scheduled jobs
 *     tags: [Admin - Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Jobs retrieved successfully
 */
router.get('/', jobController.listJobs.bind(jobController));

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
 *     responses:
 *       200:
 *         description: Job triggered successfully
 */
router.post('/:jobName/trigger', jobController.triggerJob.bind(jobController));

/**
 * @swagger
 * /admin/jobs/rewards/custom:
 *   post:
 *     summary: Run a custom rewards notification job
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
 *               - periodType
 *             properties:
 *               periodType:
 *                 type: string
 *                 enum: [daily, weekly, monthly]
 *     responses:
 *       200:
 *         description: Custom job executed successfully
 */
router.post('/rewards/custom', jobController.runCustomRewardsJob.bind(jobController));

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
 *     responses:
 *       200:
 *         description: Job stopped successfully
 */
router.post('/:jobName/stop', jobController.stopJob.bind(jobController));

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
 *     responses:
 *       200:
 *         description: Job started successfully
 */
router.post('/:jobName/start', jobController.startJob.bind(jobController));

export default router;
