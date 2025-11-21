import { Router } from 'express';
import { onramperController } from '../controllers/onramper.controller';
import { adminAuth } from '../middleware/admin.middleware';

const router = Router();

// All routes require admin authentication
router.use(adminAuth);

/**
 * @swagger
 * /admin/onramper/webhook-url:
 *   patch:
 *     summary: Update Onramper webhook URL
 *     description: Sets or updates the webhook URL in Onramper merchant dashboard
 *     tags: [Admin - Onramper]
 *     security:
 *       - AdminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - webhookUrl
 *             properties:
 *               webhookUrl:
 *                 type: string
 *                 format: uri
 *                 example: https://yourdomain.com/api/v1/webhooks/onramper
 *                 description: Must be HTTPS URL that accepts POST requests
 *     responses:
 *       200:
 *         description: Webhook URL updated successfully
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
 *                   example: Webhook URL updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: number
 *                       example: 1
 *                     code:
 *                       type: number
 *                       example: 200
 *                     data:
 *                       type: string
 *                       example: Webhook url set to https://yourdomain.com/api/v1/webhooks/onramper
 *       400:
 *         description: Invalid request (missing or invalid webhook URL)
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
 *                   example: Webhook URL must use HTTPS protocol
 *       401:
 *         description: Unauthorized - Admin authentication required
 *       500:
 *         description: Server error
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
 *                   example: Failed to update webhook URL
 */
router.patch('/webhook-url', onramperController.updateWebhookUrl.bind(onramperController));

/**
 * @swagger
 * /admin/onramper/test-webhook:
 *   post:
 *     summary: Send a test/dummy webhook
 *     description: Triggers Onramper to send a dummy webhook with sample transaction data to test your webhook endpoint
 *     tags: [Admin - Onramper]
 *     security:
 *       - AdminAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               webhookUrl:
 *                 type: string
 *                 format: uri
 *                 example: https://yourdomain.com/api/v1/webhooks/onramper
 *                 description: Optional - URL to send test webhook to. If not provided, uses currently configured webhook URL
 *     responses:
 *       200:
 *         description: Test webhook sent successfully
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
 *                   example: Test webhook sent successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: number
 *                       example: 1
 *                     code:
 *                       type: number
 *                       example: 200
 *                     data:
 *                       type: string
 *                       example: Sent webhook
 *       400:
 *         description: Invalid webhook URL
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
 *                   example: Invalid webhook URL format
 *       401:
 *         description: Unauthorized - Admin authentication required
 *       500:
 *         description: Server error
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
 *                   example: Failed to send test webhook
 */
router.post('/test-webhook', onramperController.sendTestWebhook.bind(onramperController));

export default router;
