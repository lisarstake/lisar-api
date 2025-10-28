import { Router } from 'express';
import { protocolController } from '../controllers/protocol.controller';
import { verifyAuth } from '../middleware/verifyAuth';

const router = Router();

/**
 * @swagger
 * /protocol/status:
 *   get:
 *     summary: Get approximate protocol round/status and timing
 *     tags: [Protocol]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Protocol status
 *       500:
 *         description: Internal error
 */
router.get('/status', verifyAuth, protocolController.getStatus.bind(protocolController));

export default router;
