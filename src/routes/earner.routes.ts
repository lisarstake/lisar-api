import { Router } from 'express';
import { earnerController } from '../controllers/earner.controller';
import { verifyAuth } from '../middleware/verifyAuth';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Earner:
 *       type: object
 *       properties:
 *         rank:
 *           type: number
 *           description: Leaderboard rank
 *           example: 1
 *         address:
 *           type: string
 *           description: Earner's wallet address
 *           example: 0x742d35Cc6634C0532925a3b8C6Cd1d31F03e46F6
 *         email:
 *           type: string
 *           description: User's email from Supabase
 *           example: user@example.com
 *         full_name:
 *           type: string
 *           description: User's full name from Supabase
 *           example: John Doe
 *         bondedAmount:
 *           type: string
 *           description: Total bonded amount in LPT
 *           example: "1000.5"
 *         lifetimeReward:
 *           type: string
 *           description: Total lifetime rewards earned from delegation
 *           example: "125.75"
 *         delegatedAmount:
 *           type: string
 *           description: Total delegated amount
 *           example: "5000.0"
 *         lastClaimRound:
 *           type: string
 *           description: Last round when rewards were claimed
 *           example: "2890"
 *         delegate:
 *           type: object
 *           properties:
 *             address:
 *               type: string
 *               description: Orchestrator address
 *               example: 0x123d35Cc6634C0532925a3b8C6Cd1d31F03e46F6
 *             feeShare:
 *               type: string
 *               description: Fee share percentage
 *               example: "50000"
 *             rewardCut:
 *               type: string
 *               description: Reward cut percentage
 *               example: "100000"
 *         # Time-filtered fields (only present when time filtering is used)
 *         periodRewards:
 *           type: string
 *           description: Rewards earned during the specified time period (only present with time filtering)
 *           example: "45.25"
 *         periodBondingActivity:
 *           type: string
 *           description: Bonding activity during the specified time period (only present with time filtering)
 *           example: "100.0"
 *         rewardEvents:
 *           type: number
 *           description: Number of reward events in the period (only present with time filtering)
 *           example: 12
 *         bondEvents:
 *           type: number
 *           description: Number of bond events in the period (only present with time filtering)
 *           example: 3
 *         topDelegate:
 *           type: string
 *           description: Address of the delegate that generated most rewards (only present with time filtering)
 *           example: 0x123...abc
 *     TopEarner:
 *       type: object
 *       properties:
 *         rank:
 *           type: number
 *           description: Rank by recent rewards
 *           example: 1
 *         address:
 *           type: string
 *           description: Earner's wallet address
 *           example: 0x742d35Cc6634C0532925a3b8C6Cd1d31F03e46F6
 *         recentReward:
 *           type: string
 *           description: Most recent reward amount
 *           example: "15.25"
 *         bondedAmount:
 *           type: string
 *           description: Total bonded amount
 *           example: "1000.5"
 *         fees:
 *           type: string
 *           description: Total fees earned
 *           example: "25.75"
 *         delegatedAmount:
 *           type: string
 *           description: Total delegated amount
 *           example: "5000.0"
 *         round:
 *           type: string
 *           description: Round when reward was earned
 *           example: "2890"
 *         delegate:
 *           type: string
 *           description: Orchestrator address
 *           example: 0x123d35Cc6634C0532925a3b8C6Cd1d31F03e46F6
 *     EarnerStats:
 *       type: object
 *       properties:
 *         totalUsers:
 *           type: number
 *           description: Total number of registered users with wallets
 *           example: 2500
 *         totalEarners:
 *           type: number
 *           description: Total number of users actively earning (with bonded amount > 0)
 *           example: 1250
 *         totalBondedAmount:
 *           type: string
 *           description: Total bonded amount across all earners
 *           example: "1500000.75"
 *         totalLifetimeRewards:
 *           type: string
 *           description: Total lifetime rewards earned across all earners
 *           example: "45000.25"
 *         averageBondedAmount:
 *           type: string
 *           description: Average bonded amount per earner
 *           example: "1200.5"
 *         averageLifetimeReward:
 *           type: string
 *           description: Average lifetime reward per earner
 *           example: "36.5"
 */

/**
 * @swagger
 * /earners/leaderboard:
 *   get:
 *     summary: Get earner leaderboard for registered users with optional time filtering
 *     description: Fetches all registered users from Supabase and queries their delegation data from Livepeer subgraph. Optional time filtering enables period-based analysis.
 *     tags: [Earners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *           default: 100
 *         description: Number of earners to return (1-1000)
 *         example: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of earners to skip for pagination
 *         example: 0
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [bondedAmount, lifetimeReward, delegatedAmount, periodRewards, periodBondingActivity]
 *           default: bondedAmount
 *         description: Field to sort by (periodRewards and periodBondingActivity only available with time filtering)
 *         example: bondedAmount
 *       - in: query
 *         name: orderDirection
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort direction
 *         example: desc
 *       - in: query
 *         name: timePeriod
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly, custom]
 *         description: Optional time period for filtering (enables period-based data)
 *         example: weekly
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for custom period (required if timePeriod is 'custom')
 *         example: 2023-01-01
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for custom period (required if timePeriod is 'custom')
 *         example: 2023-01-31
 *     responses:
 *       200:
 *         description: Successfully retrieved earner leaderboard
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
 *                     earners:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Earner'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         limit:
 *                           type: number
 *                           example: 50
 *                         offset:
 *                           type: number
 *                           example: 0
 *                         total:
 *                           type: number
 *                           example: 1250
 *                     period:
 *                       type: object
 *                       description: Only present when time filtering is used
 *                       properties:
 *                         startTimestamp:
 *                           type: number
 *                           description: Start timestamp of the period
 *                           example: 1640995200
 *                         endTimestamp:
 *                           type: number
 *                           description: End timestamp of the period
 *                           example: 1641600000
 *                         description:
 *                           type: string
 *                           description: Human-readable description of the time period
 *                           example: Last 7 days
 *       400:
 *         description: Bad request - invalid parameters
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
 *                   example: Invalid limit parameter. Must be between 1 and 1000
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
 *       404:
 *         description: No earners found
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
 *                   example: No earners found
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
router.get('/leaderboard', verifyAuth, (req, res) => earnerController.getEarnerLeaderboard(req, res));

/**
 * @swagger
 * /earners/top-by-rewards:
 *   get:
 *     summary: Get top earners by recent rewards
 *     tags: [Earners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Number of top earners to return (1-100)
 *         example: 25
 *     responses:
 *       200:
 *         description: Successfully retrieved top earners by rewards
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
 *                     topEarners:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TopEarner'
 *       400:
 *         description: Bad request - invalid limit parameter
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
 *                   example: Invalid limit parameter. Must be between 1 and 100
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
 *       404:
 *         description: No recent rewards found
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
 *                   example: No recent rewards found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                 type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.get('/top-by-rewards', verifyAuth, (req, res) => earnerController.getTopEarnersByRewards(req, res));

/**
 * @swagger
 * /earners/stats:
 *   get:
 *     summary: Get overall earner statistics
 *     tags: [Earners]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved earner statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/EarnerStats'
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
 *       404:
 *         description: No earners found for statistics
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
 *                   example: No earners found for statistics
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
router.get('/stats', verifyAuth, (req, res) => earnerController.getEarnerStats(req, res));

export default router;
