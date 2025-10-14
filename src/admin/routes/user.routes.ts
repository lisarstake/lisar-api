import { Router } from 'express';
import { adminUserController } from '../controllers/user.controller';
import { adminAuth, requireAdmin, requireSuperAdmin } from '../middleware/admin.middleware';

const router = Router();

// All routes require admin authentication
router.use(adminAuth);

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     adminAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     AdminUser:
 *       type: object
 *       properties:
 *         user_id:
 *           type: string
 *         privy_user_id:
 *           type: string
 *         wallet_address:
 *           type: string
 *         wallet_id:
 *           type: string
 *         lpt_balance:
 *           type: number
 *         is_suspended:
 *           type: boolean
 *         suspension_reason:
 *           type: string
 *         suspended_at:
 *           type: string
 *         created_at:
 *           type: string
 *         updated_at:
 *           type: string
 */

/**
 * @swagger
 * /admin/users/stats:
 *   get:
 *     summary: Get user statistics
 *     tags: [Admin - Users]
 *     security:
 *       - adminAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
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
 *                     totalUsers:
 *                       type: number
 *                     activeUsers:
 *                       type: number
 *                     suspendedUsers:
 *                       type: number
 *                     totalLptBalance:
 *                       type: number
 *                     newUsersToday:
 *                       type: number
 */
router.get('/stats', requireAdmin, adminUserController.getUserStats);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users with pagination and filters
 *     tags: [Admin - Users]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of users per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by user ID, privy user ID, or wallet address
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, suspended, all]
 *         description: Filter by user status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [created_at, lpt_balance, user_id]
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
router.get('/', requireAdmin, adminUserController.getUsers);

/**
 * @swagger
 * /admin/users/{userId}:
 *   get:
 *     summary: Get user details by ID
 *     tags: [Admin - Users]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *       404:
 *         description: User not found
 */
router.get('/:userId', requireAdmin, adminUserController.getUserDetails);

/**
 * @swagger
 * /admin/users/{userId}/suspend:
 *   post:
 *     summary: Suspend a user
 *     tags: [Admin - Users]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for suspension
 *     responses:
 *       200:
 *         description: User suspended successfully
 *       400:
 *         description: Bad request
 */
router.post('/:userId/suspend', requireAdmin, adminUserController.suspendUser);

/**
 * @swagger
 * /admin/users/{userId}/unsuspend:
 *   post:
 *     summary: Unsuspend a user
 *     tags: [Admin - Users]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User unsuspended successfully
 *       400:
 *         description: Bad request
 */
router.post('/:userId/unsuspend', requireAdmin, adminUserController.unsuspendUser);

/**
 * @swagger
 * /admin/users/{userId}/balance:
 *   put:
 *     summary: Update user's LPT balance (Super Admin only)
 *     tags: [Admin - Users]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - balance
 *               - reason
 *             properties:
 *               balance:
 *                 type: number
 *                 minimum: 0
 *                 description: New LPT balance
 *               reason:
 *                 type: string
 *                 description: Reason for balance update
 *     responses:
 *       200:
 *         description: Balance updated successfully
 *       403:
 *         description: Super admin access required
 */
router.put('/:userId/balance', requireSuperAdmin, adminUserController.updateUserBalance);

export default router;
