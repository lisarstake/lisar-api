import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { verifyAuth } from '../middleware/verifyAuth';
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User and wallet management endpoints
 */

/**
 * @swagger
 * /users/create-with-wallet:
 *   post:
 *     summary: Create a new user with an automatic wallet
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: password123
 *               full_name:
 *                 type: string
 *                 example: John Doe
 *     responses:
 *       201:
 *         description: User and wallet created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User created with wallet successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     privy_user_id:
 *                       type: string
 *                       example: privy_user_123
 *                     wallet:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: wallet_123
 *                         address:
 *                           type: string
 *                           example: 0x742d35Cc6634C0532925a3b8C6Cd1d31F03e46F6
 *                         chain_type:
 *                           type: string
 *                           example: ethereum
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/create-with-wallet', userController.createUserWithWallet.bind(userController));

/**
 * @swagger
 * /users/test-privy:
 *   get:
 *     summary: Test Privy connection
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Privy connection successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Privy connection successful
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       503:
 *         description: Privy connection failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Privy configuration not initialized
 */
router.get('/test-privy', userController.testPrivyConnection.bind(userController));

/**
 * @swagger
 * /users/profile/{userId}:
 *   get:
 *     summary: Get user profile by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to retrieve
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User profile retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/profile/:userId',verifyAuth, userController.getUserProfile.bind(userController));

/**
 * @swagger
 * /users/profile/{userId}:
 *   patch:
 *     summary: Update user profile by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: John Doe
 *               img:
 *                 type: string
 *                 example: https://example.com/profile.jpg
 *               DOB:
 *                 type: string
 *                 format: date
 *                 example: 1990-01-01
 *               country:
 *                 type: string
 *                 example: USA
 *               state:
 *                 type: string
 *                 example: California
 *               fiat_type:
 *                 type: string
 *                 example: USD
 *               fiat_balance:
 *                 type: number
 *                 example: 1000
 *               lpt_balance:
 *                 type: number
 *                 example: 50
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User profile updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/profile/:userId', verifyAuth, userController.updateUserProfile.bind(userController));
/**
 * @swagger
 * /users/profile/{userId}/onboard:
 *   patch:
 *     summary: Update user's onboarding status
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               is_onboarded:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Onboard status updated
 *       400:
 *         description: Bad request
 */
router.patch('/profile/:userId/onboard', verifyAuth, userController.updateUserOnboardStatus.bind(userController));

export default router;