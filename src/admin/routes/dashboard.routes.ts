import { Router } from 'express';
import { adminDashboardController } from '../controllers/dashboard.controller';
import { adminAuth } from '../middleware/admin.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Admin - Dashboard
 *     description: Admin dashboard and system overview endpoints
 */

/**
 * @swagger
 * /admin/dashboard/summary:
 *   get:
 *     summary: Get dashboard summary (KPIs)
 *     tags: [Admin - Dashboard]
 *     security:
 *       - adminAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary returned
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
 *                     totalDelegators:
 *                       type: integer
 *                     totalNgNConverted:
 *                       type: number
 *                     totalLptDelegated:
 *                       type: number
 *                     totalRewardsDistributedNgn:
 *                       type: number
 *                     lastUpdated:
 *                       type: string
 */
router.get('/summary', adminDashboardController.summary);

/**
 * @swagger
 * /admin/dashboard/transactions:
 *   get:
 *     summary: Get recent transactions for dashboard
 *     tags: [Admin - Dashboard]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of recent transactions to return
 *     responses:
 *       200:
 *         description: Recent transactions returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/transactions', adminDashboardController.recentTransactions);

/**
 * @swagger
 * /admin/dashboard/health:
 *   get:
 *     summary: Get health status of external services
 *     tags: [Admin - Dashboard]
 *     security:
 *       - adminAuth: []
 *     responses:
 *       200:
 *         description: Health status returned
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
 *                     onramp:
 *                       type: string
 *                     privy:
 *                       type: string
 *                     subgraph:
 *                       type: string
 *                     supabase:
 *                       type: string
 */
router.get('/health', adminAuth, adminDashboardController.health);

export default router;
