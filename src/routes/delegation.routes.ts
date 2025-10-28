import { Router } from 'express';
import { delegationController } from '../controllers/delegation.controller';
import { verifyAuth } from '../middleware/verifyAuth';

const router = Router();

/**
 * @swagger
 * /delegation/{delegator}:
 *   get:
 *     summary: Get delegation information for a delegator
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
 *         example: 0x742d35Cc6634C0532925a3b8C6Cd1d31F03e46F6
 *     responses:
 *       200:
 *         description: Successfully retrieved delegation data
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
 *                       description: Delegator address
 *                       example: 0x742d35Cc6634C0532925a3b8C6Cd1d31F03e46F6
 *                     bondedAmount:
 *                       type: string
 *                       description: Amount of tokens bonded
 *                       example: "1000.5"
 *                     fees:
 *                       type: string
 *                       description: Accumulated fees
 *                       example: "50.25"
 *                     delegatedAmount:
 *                       type: string
 *                       description: Total delegated amount
 *                       example: "5000.0"
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
 *                   example: Internal server error
 */
router.get('/:delegator', verifyAuth, delegationController.getDelegations.bind(delegationController));

/**
 * @swagger
 * /delegation/{delegator}/transactions:
 *   get:
 *     summary: Get delegator onchain transactions (pending and completed)
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
 *         example: 0x742d35Cc6634C0532925a3b8C6Cd1d31F03e46F6
 *     responses:
 *       200:
 *         description: Successfully retrieved delegator transactions
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
 *                   properties:
 *                     currentRound:
 *                       type: string
 *                       description: The current round ID used for filtering
 *                       example: "2890"
 *                     pendingStakeTransactions:
 *                       type: array
 *                       description: Unbonding locks that are still pending
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "1"
 *                           amount:
 *                             type: string
 *                             example: "100.5"
 *                           unbondingLockId:
 *                             type: number
 *                             example: 1
 *                           withdrawRound:
 *                             type: string
 *                             example: "2900"
 *                     completedStakeTransactions:
 *                       type: array
 *                       description: Unbonding locks ready for withdrawal
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "2"
 *                           amount:
 *                             type: string
 *                             example: "50.0"
 *                           unbondingLockId:
 *                             type: number
 *                             example: 2
 *                           withdrawRound:
 *                             type: string
 *                             example: "2880"
 *       404:
 *         description: Delegator not found
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
 *                   example: Internal server error
 */
router.get('/:delegator/transactions', verifyAuth, (req, res) => delegationController.getDelegatorTransactions(req, res));

/**
 * @swagger
 * /delegation/{delegator}/rewards:
 *   get:
 *     summary: Get delegator rewards over rounds
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
 *         example: 0x742d35Cc6634C0532925a3b8C6Cd1d31F03e46F6
 *     responses:
 *       200:
 *         description: Successfully retrieved delegator rewards over rounds
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
 *                   properties:
 *                     rewards:
 *                       type: array
 *                       description: Array of reward events over rounds
 *                       items:
 *                         type: object
 *                         properties:
 *                           round:
 *                             type: string
 *                             description: Round ID when rewards were earned
 *                             example: "2890"
 *                           rewardTokens:
 *                             type: string
 *                             description: Amount of reward tokens earned
 *                             example: "25.75"
 *                           delegate:
 *                             type: string
 *                             description: Orchestrator address that generated rewards
 *                             example: 0x123d35Cc6634C0532925a3b8C6Cd1d31F03e46F6
 *                           timestamp:
 *                             type: string
 *                             description: Unix timestamp of the reward event
 *                             example: "1640995200"
 *                           transactionHash:
 *                             type: string
 *                             description: Transaction hash of the reward event
 *                             example: 0xabc123def456ghi789...
 *       404:
 *         description: No transactions found for this delegator
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
 *                   example: No transactions found for this delegator
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
 *                   example: Internal server error
 */
router.get('/:delegator/rewards', verifyAuth, (req, res) => delegationController.getDelegatorRewards(req, res));

/**
 * @swagger
 * /delegation/{delegator}:
 *   get:
 *     summary: Get delegation details for a specific delegator
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
 *         example: 0x742d35Cc6634C0532925a3b8C6Cd1d31F03e46F6
 *     responses:
 *       200:
 *         description: Delegation details retrieved successfully
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
 *                       description: Delegator address
 *                       example: 0x742d35Cc6634C0532925a3b8C6Cd1d31F03e46F6
 *                     bondedAmount:
 *                       type: string
 *                       description: Amount of tokens bonded
 *                       example: "1000.5"
 *                     fees:
 *                       type: string
 *                       description: Accumulated fees
 *                       example: "50.25"
 *                     delegatedAmount:
 *                       type: string
 *                       description: Total delegated amount
 *                       example: "5000.0"
 *                     unbondingLocks:
 *                       type: array
 *                       description: Array of unbonding locks
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "1"
 *                           amount:
 *                             type: string
 *                             example: "100.0"
 *                           unbondingLockId:
 *                             type: number
 *                             example: 1
 *                           withdrawRound:
 *                             type: string
 *                             example: "2900"
 *                           delegate:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: 0x123d35Cc6634C0532925a3b8C6Cd1d31F03e46F6
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
 *     summary: Delegate tokens to a Livepeer orchestrator
 *     tags: [Delegation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletId
 *               - walletAddress
 *               - orchestratorAddress
 *               - amount
 *             properties:
 *               walletId:
 *                 type: string
 *                 description: Privy wallet ID
 *                 example: wallet_123
 *               walletAddress:
 *                 type: string
 *                 description: Wallet address
 *                 example: 0x742d35Cc6634C0532925a3b8C6Cd1d31F03e46F6
 *               orchestratorAddress:
 *                 type: string
 *                 description: Livepeer orchestrator address to delegate to
 *                 example: 0x123d35Cc6634C0532925a3b8C6Cd1d31F03e46F6
 *               amount:
 *                 type: string
 *                 description: Amount of LPT tokens to delegate (in ETH units)
 *                 example: "100.0"
 *     responses:
 *       200:
 *         description: Successfully delegated tokens
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
 *                   example: 0xabc123def456...
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Missing required fields
 *       401:
 *         description: Unauthorized - missing authorization token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Authorization token is required
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
 *                   example: Internal server error
 */
router.post('/stake', (req, res) => delegationController.delegate(req, res));

/**
 * @swagger
 * /delegation/all/{delegator}:
 *   get:
 *     summary: Get all delegations for a delegator
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
 *         example: 0x742d35Cc6634C0532925a3b8C6Cd1d31F03e46F6
 *     responses:
 *       200:
 *         description: Successfully retrieved all delegations
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
 *                   properties:
 *                     delegator:
 *                       type: object
 *                       description: Delegator information
 *                     delegations:
 *                       type: array
 *                       description: Array of delegations
 *                       items:
 *                         type: object
 *       404:
 *         description: Delegator not found
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
 *                   example: Failed to fetch delegations
 */
router.get('/all/:delegator', verifyAuth, delegationController.getAllDelegations.bind(delegationController));

/**
 * @swagger
 * /delegation/orchestrators/{delegator}:
 *   get:
 *     summary: Get delegations to orchestrators for a delegator
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
 *         example: 0x742d35Cc6634C0532925a3b8C6Cd1d31F03e46F6
 *     responses:
 *       200:
 *         description: Successfully retrieved delegations to orchestrators
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
 *                         description: Orchestrator address
 *                         example: 0x123d35Cc6634C0532925a3b8C6Cd1d31F03e46F6
 *                       amount:
 *                         type: string
 *                         description: Total delegated amount
 *                         example: "1000.5"
 *       404:
 *         description: No delegations found
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
 *                   example: No delegations found
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
 *                   example: Failed to fetch delegations to orchestrators
 */
router.get('/orchestrators/:delegator', verifyAuth, delegationController.getDelegationsToOrchestrators.bind(delegationController));

/**
 * @swagger
 * /delegation/rewards/{delegator}/{transcoder}:
 *   get:
 *     summary: Get pending rewards for a delegator from a specific transcoder
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
 *         example: 0x742d35Cc6634C0532925a3b8C6Cd1d31F03e46F6
 *       - in: path
 *         name: transcoder
 *         required: true
 *         schema:
 *           type: string
 *         description: The transcoder's address
 *         example: 0x123d35Cc6634C0532925a3b8C6Cd1d31F03e46F6
 *     responses:
 *       200:
 *         description: Successfully retrieved pending rewards
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
 *                   description: Pending rewards amount
 *                   example: "15.75"
 *       404:
 *         description: Delegator not found
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
 *             required:
 *               - walletId
 *               - walletAddress
 *               - amount
 *             properties:
 *               walletId:
 *                 type: string
 *                 description: Privy wallet ID
 *                 example: wallet_123
 *               walletAddress:
 *                 type: string
 *                 description: Wallet address
 *                 example: 0x742d35Cc6634C0532925a3b8C6Cd1d31F03e46F6
 *               amount:
 *                 type: string
 *                 description: Amount of LPT tokens to unbond (in ETH units)
 *                 example: "50.0"
 *     responses:
 *       200:
 *         description: Successfully unbonded tokens
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
 *                   example: 0xdef456ghi789...
 *       400:
 *         description: Bad request - missing required fields
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
 *       401:
 *         description: Unauthorized - missing authorization token
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
 *                   example: Authorization token is required
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
router.post('/unbond',verifyAuth, (req, res) => delegationController.undelegate(req, res));

/**
 * @swagger
 * /delegation/withdraw-stake:
 *   post:
 *     summary: Withdraw unbonded stake from Livepeer
 *     tags: [Delegation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletId
 *               - walletAddress
 *               - unbondingLockId
 *             properties:
 *               walletId:
 *                 type: string
 *                 description: Privy wallet ID
 *                 example: wallet_123
 *               walletAddress:
 *                 type: string
 *                 description: Wallet address
 *                 example: 0x742d35Cc6634C0532925a3b8C6Cd1d31F03e46F6
 *               unbondingLockId:
 *                 type: number
 *                 description: The unbonding lock ID from the unbond transaction
 *                 example: 1
 *     responses:
 *       200:
 *         description: Successfully withdrew unbonded stake
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
 *                   example: Successfully withdrew unbonded stake from Livepeer
 *                 txHash:
 *                   type: string
 *                   example: 0xghi789...
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
 *                   example: walletId, walletAddress, and unbondingLockId are required
 *       401:
 *         description: Unauthorized
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
 *                   example: Authorization token is required
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
 *                   example: Internal server error
 */
router.post('/withdraw-stake',verifyAuth, (req, res) => delegationController.withdrawStake(req, res));

/**
 * @swagger
 * /delegation/withdraw-fees:
 *   post:
 *     summary: Withdraw earned fees from Livepeer
 *     tags: [Delegation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletId
 *               - walletAddress
 *               - amount
 *             properties:
 *               walletId:
 *                 type: string
 *                 description: Privy wallet ID
 *                 example: wallet_123
 *               walletAddress:
 *                 type: string
 *                 description: Wallet address
 *                 example: 0x742d35Cc6634C0532925a3b8C6Cd1d31F03e46F6
 *               amount:
 *                 type: string
 *                 description: Amount of fees to withdraw (in ETH units)
 *                 example: "10.5"
 *     responses:
 *       200:
 *         description: Successfully withdrew fees
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
 *                   example: Successfully withdrew fees from Livepeer
 *                 txHash:
 *                   type: string
 *                   example: 0xjkl012...
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
 *                   example: walletId, walletAddress, and amount are required
 *       401:
 *         description: Unauthorized
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
 *                   example: Authorization token is required
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
 *                   example: Internal server error
 */
router.post('/withdraw-fees',verifyAuth, (req, res) => delegationController.withdrawFees(req, res));

/**
 * @swagger
 * /delegation/{delegator}/transactions:
 *   get:
 *     summary: Get delegator onchain transactions (pending and completed)
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
 *         example: 0x742d35Cc6634C0532925a3b8C6Cd1d31F03e46F6
 *     responses:
 *       200:
 *         description: Successfully retrieved delegator transactions
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
 *                   properties:
 *                     currentRound:
 *                       type: string
 *                       description: The current round ID used for filtering
 *                       example: "2890"
 *                     pendingStakeTransactions:
 *                       type: array
 *                       description: Unbonding locks that are still pending (withdrawRound > currentRound)
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "1"
 *                           amount:
 *                             type: string
 *                             example: "100.5"
 *                           unbondingLockId:
 *                             type: number
 *                             example: 1
 *                           withdrawRound:
 *                             type: string
 *                             example: "2900"
 *                           delegate:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: 0x123d35Cc6634C0532925a3b8C6Cd1d31F03e46F6
 *                     completedStakeTransactions:
 *                       type: array
 *                       description: Unbonding locks that are ready for withdrawal (withdrawRound <= currentRound)
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "2"
 *                           amount:
 *                             type: string
 *                             example: "50.0"
 *                           unbondingLockId:
 *                             type: number
 *                             example: 2
 *                           withdrawRound:
 *                             type: string
 *                             example: "2880"
 *                           delegate:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: 0x456d35Cc6634C0532925a3b8C6Cd1d31F03e46F6
 *       404:
 *         description: Delegator not found
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
 *                   example: Internal server error
 */
router.get('/:delegator/transactions',verifyAuth, (req, res) => delegationController.getDelegatorTransactions(req, res));

export default router;

