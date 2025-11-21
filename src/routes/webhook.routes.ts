import { Router } from 'express';
import { webhookController } from '../controllers/webhook.controller';

const router = Router();

/**
 * @swagger
 * /webhooks/privy:
 *   post:
 *     summary: Handle Privy webhook events
 *     tags: [Webhooks]
 *     security: []  # No auth required for webhooks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PrivyWebhookEvent'
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 received:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Invalid webhook signature
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid webhook signature
 *       500:
 *         description: Error processing webhook
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to process webhook
 */
router.post('/privy', webhookController.handlePrivyWebhook.bind(webhookController));

/**
 * @swagger
 * /webhooks/onramper:
 *   post:
 *     summary: Handle Onramper webhook events
 *     description: Receives webhook notifications for completed onramp transactions from Onramper
 *     tags: [Webhooks]
 *     security: []  # No auth required for webhooks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OnramperWebhookEvent'
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Received data :)
 *       401:
 *         description: Missing webhook headers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Missing required webhook headers
 *       403:
 *         description: Invalid webhook signature
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid signature
 *       500:
 *         description: Error processing webhook
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to process webhook
 */
router.post('/onramper', webhookController.handleOnramperWebhook.bind(webhookController));

export default router;

