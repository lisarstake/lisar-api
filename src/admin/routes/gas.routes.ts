import { Router } from 'express';
import { adminAuth } from '../middleware/admin.middleware';
import { adminGasController } from '../controllers/gas.controller';

const router = Router();

/**
 * @swagger
 * /admin/gas-topup:
 *   post:
 *     summary: Top up ETH for user wallets that are below a threshold
 *     tags: [Admin - Gas]
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: string
 *                 description: Amount of ETH to top up per underfunded wallet (decimal string, e.g. "0.01")
 *                 example: "0.01"
 *     responses:
 *       200:
 *         description: Gas top up completed (or skipped where not needed). Returns summary and per-user details.
 *       400:
 *         description: Bad request - missing or invalid amount
 *       401:
 *         description: Unauthorized - admin authentication required
 *       500:
 *         description: Internal server error
 */
router.post('/', adminAuth, (req, res) => adminGasController.topUpAll(req, res));

export default router;
