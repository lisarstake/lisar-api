import { Router } from 'express';
import { delegationController } from '../controllers/delegation.controller';
import { verifyAuth } from '../middleware/verifyAuth';

const router = Router();

/**
 * @swagger
 * /delegation/{delegator}:
 *   get:
 *     summary: Fetch delegations for a delegator
 *     tags: [Delegation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: delegator
 *         required: true
 *         schema:
 *           type: string
 *         description: The delegator's address
 *     responses:
 *       200:
 *         description: Delegation data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   description: Delegation details or null if no data is found
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "0x1234567890abcdef"
 *                     bondedAmount:
 *                       type: string
 *                       example: "1000"
 *                     fees:
 *                       type: string
 *                       example: "50"
 *                     delegatedAmount:
 *                       type: string
 *                       example: "5000"
 *                     unbondingLocks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "1"
 *                           amount:
 *                             type: string
 *                             example: "100"
 *                           withdrawRound:
 *                             type: string
 *                             example: "10"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Failed to fetch delegations
 */
router.get('/:delegator', verifyAuth, delegationController.getDelegations.bind(delegationController));

/**
 * @swagger
 * /delegation/stake:
 *   post:
 *     summary: Delegate to an orchestrator
 *     tags: [Delegation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               walletId:
 *                 type: string
 *                 description: The wallet ID of the delegator
 *                 example: "0x1234567890abcdef"
 *               walletAddress:
 *                 type: string
 *                 description: The wallet address of the delegator
 *                 example: "0x1234567890abcdef"
 *               orchestratorAddress:
 *                 type: string
 *                 description: The orchestrator's address
 *                 example: "0xfedcba0987654321"
 *               amount:
 *                 type: string
 *                 description: The amount to delegate
 *                 example: "1000"
 *     responses:
 *       200:
 *         description: Delegation successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   description: Delegation transaction details
 *                   properties:
 *                     transactionHash:
 *                       type: string
 *                       example: "0xabcdef1234567890"
 *                     blockNumber:
 *                       type: string
 *                       example: "123456"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Invalid request data
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Failed to process delegation
 */
router.post('/stake', (req, res) => delegationController.delegate(req, res));

/**
 * @swagger
 * /delegation/all/{delegator}:
 *   get:
 *     summary: Fetch all delegations for a delegator
 *     tags: [Delegation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: delegator
 *         required: true
 *         schema:
 *           type: string
 *         description: The delegator's address
 *     responses:
 *       200:
 *         description: Delegation data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   description: Delegation details
 *       500:
 *         description: Internal server error
 */
router.get('/all/:delegator', verifyAuth, delegationController.getAllDelegations.bind(delegationController));

/**
 * @swagger
 * /delegation/orchestrators/{delegator}:
 *   get:
 *     summary: Fetch delegations to orchestrators for a delegator
 *     tags: [Delegation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: delegator
 *         required: true
 *         schema:
 *           type: string
 *         description: The delegator's address
 *     responses:
 *       200:
 *         description: Delegation data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 delegations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       delegate:
 *                         type: string
 *                         example: "0x1234567890abcdef"
 *                       amount:
 *                         type: string
 *                         example: "1000"
 *       500:
 *         description: Internal server error
 */
router.get('/orchestrators/:delegator', verifyAuth, delegationController.getDelegationsToOrchestrators.bind(delegationController));

/**
 * @swagger
 * /delegation/rewards/{delegator}/{transcoder}:
 *   get:
 *     summary: Fetch pending rewards for a delegator from a specific transcoder
 *     tags: [Delegation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: delegator
 *         required: true
 *         schema:
 *           type: string
 *         description: The delegator's address
 *       - in: path
 *         name: transcoder
 *         required: true
 *         schema:
 *           type: string
 *         description: The transcoder's address
 *     responses:
 *       200:
 *         description: Pending rewards data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 rewards:
 *                   type: string
 *                   example: "1000"
 *       404:
 *         description: Delegator or transcoder not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Delegator not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Failed to fetch pending rewards
 */
router.get('/rewards/:delegator/:transcoder', verifyAuth, delegationController.getPendingRewards.bind(delegationController));

/**
 * @swagger
 * /delegation/unbond:
 *   post:
 *     summary: Unbond tokens from a Livepeer orchestrator
 *     tags: [Delegation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               walletId:
 *                 type: string
 *                 description: The wallet ID of the delegator
 *                 example: "0x1234567890abcdef"
 *               walletAddress:
 *                 type: string
 *                 description: The wallet address of the delegator
 *                 example: "0x1234567890abcdef"
 *               amount:
 *                 type: string
 *                 description: The amount to unbond
 *                 example: "1000"
 *     responses:
 *       200:
 *         description: Unbonding successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 txHash:
 *                   type: string
 *                   example: "0xabcdef1234567890"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Missing required fields
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Failed to unbond tokens
 */
router.post('/unbond', (req, res) => delegationController.undelegate(req, res));

export default router;
