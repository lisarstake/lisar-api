import { Router } from 'express';
import { orchestratorController } from '../controllers/orchestrator.controller';
import { verifyAuth } from '../middleware/verifyAuth';

const router = Router();

/**
 * @swagger
 * /orchestrator:
 *   get:
 *     summary: Fetch transcoders from the subgraph with pagination, sorting, and filtering
 *     description: |
 *       Returns a paginated list of Livepeer transcoders (orchestrators) fetched from the subgraph.
 *       Supports sorting by APY, stake, active time and other fields, and filtering by APY range, stake range and active status.
 *     tags: [Orchestrator]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination (1-indexed)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page (max recommended 100)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [apy, totalStake, activeSince, totalVolumeETH, fee, reward]
 *           default: totalStake
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: minApy
 *         schema:
 *           type: number
 *         description: Minimum APY filter (numeric percent, e.g. 10.5)
 *       - in: query
 *         name: maxApy
 *         schema:
 *           type: number
 *         description: Maximum APY filter
 *       - in: query
 *         name: minStake
 *         schema:
 *           type: number
 *         description: Minimum total stake filter (units depend on the subgraph response)
 *       - in: query
 *         name: maxStake
 *         schema:
 *           type: number
 *         description: Maximum total stake filter
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status (true/false)
 *     responses:
 *       200:
 *         description: Paginated subgraph query result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   description: The list of transcoders
 *                   items:
 *                     type: object
 *                     properties:
 *                       address:
 *                         type: string
 *                         example: "0x1234567890abcdef"
 *                       ensName:
 *                         type: string
 *                         example: "example.eth"
 *                       apy:
 *                         type: number
 *                         example: 12.5
 *                       totalStake:
 *                         type: number
 *                         example: 1000000
 *                       totalVolumeETH:
 *                         type: number
 *                         example: 500
 *                       performance:
 *                         type: string
 *                         enum: [Excellent, Very Good, Good, Average]
 *                         example: "Good"
 *                       fee:
 *                         type: number
 *                         example: 5
 *                       reward:
 *                         type: number
 *                         example: 10
 *                       active:
 *                         type: boolean
 *                         example: true
 *                       activeSince:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-01-01T00:00:00Z"
 *                       description:
 *                         type: string
 *                         example: "Livepeer transcoder"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 100
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 10
 *                     limit:
 *                       type: integer
 *                       example: 10
 *       400:
 *         description: Bad request — invalid parameters
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
 *                   example: "Invalid sortBy value"
 *       401:
 *         description: Unauthorized — missing or invalid bearer token
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
 *                   example: "Unauthorized"
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
 *                   example: Unknown error
 *     x-examples:
 *       curl: |
 *         curl -X GET "http://localhost:3000/api/v1/orchestrator?page=1&limit=10&sortBy=apy&sortOrder=desc&minApy=5" \
 *           -H "Authorization: Bearer <token>"
 */

/**
 * @swagger
 * /orchestrator/{id}/apy:
 *   get:
 *     summary: Calculate APY for a single orchestrator
 *     tags: [Orchestrator]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Orchestrator (transcoder) address or id
 *       - in: query
 *         name: principle
 *         schema:
 *           type: number
 *         description: Principle amount in LPT to compute ROI (defaults to 1)
 *       - in: query
 *         name: timeHorizon
 *         schema:
 *           type: string
 *           enum: [half-year, one-year, two-years, three-years, four-years]
 *         description: Time horizon for ROI calculation
 *       - in: query
 *         name: inflationChange
 *         schema:
 *           type: string
 *           enum: [none, positive, negative]
 *         description: Inflation change assumption
 *       - in: query
 *         name: factors
 *         schema:
 *           type: string
 *           enum: [lpt+eth, lpt, eth]
 *         description: Which factors to include in ROI
 *     responses:
 *       200:
 *         description: APY calculation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 apyPercent:
 *                   type: number
 *                   example: 12.5
 *                 roi:
 *                   type: object
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Orchestrator not found
 *       500:
 *         description: Internal error
 */

// GET / - Fetch transcoders from the subgraph (protected)
router.get('/', verifyAuth, orchestratorController.querySubgraph.bind(orchestratorController));

// GET /:id/apy - Calculate APY for a single orchestrator (protected)
router.get('/:id/apy', verifyAuth, orchestratorController.calculateApy.bind(orchestratorController));

export default router;
