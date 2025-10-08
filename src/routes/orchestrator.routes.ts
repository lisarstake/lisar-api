import { Router } from 'express';
import { orchestratorController } from '../controllers/orchestrator.controller';
import { verifyAuth } from '../middleware/verifyAuth';

const router = Router();

/**
 * @swagger
 * /orchestrator:
 *   get:
 *     summary: Fetch all transcoders from the subgraph
 *     tags: [Orchestrator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subgraph query result
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
 *                         type: string
 *                         example: "10%"
 *                       totalStake:
 *                         type: string
 *                         example: "1000000"
 *                       totalVolumeETH:
 *                         type: string
 *                         example: "500"
 *                       performance:
 *                         type: string
 *                         example: "Good"
 *                       fee:
 *                         type: string
 *                         example: "5%"
 *                       reward:
 *                         type: string
 *                         example: "10%"
 *                       active:
 *                         type: boolean
 *                         example: true
 *                       description:
 *                         type: string
 *                         example: "Livepeer transcoder"
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
 */

// POST / - Fetch all transcoders from the subgraph (protected)
router.get('/', verifyAuth, orchestratorController.querySubgraph.bind(orchestratorController));

export default router;
