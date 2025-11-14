import { Router } from 'express';
import { walletController } from '../controllers/wallet.controller';
import { verifyAuth } from '../middleware/verifyAuth';

const router = Router();

/**
 * @swagger
 * /wallet/{walletId}:
 *   get:
 *     summary: Fetch a wallet by ID
 *     tags: [Wallet]
 *     parameters:
 *       - in: path
 *         name: walletId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the wallet to fetch
 *     responses:
 *       200:
 *         description: Wallet details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 wallet:
 *                   type: object
 *                   description: Wallet details
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Wallet ID is required
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */

/**
 * @swagger
 * /wallet/{walletId}/export:
 *   get:
 *     summary: Export a wallet's private key
 *     tags: [Wallet]
 *     parameters:
 *       - in: path
 *         name: walletId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the wallet to export the private key for
 *     responses:
 *       200:
 *         description: Private key exported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 privateKey:
 *                   type: string
 *                   description: The exported private key
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Wallet ID is required
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */

/**
 * @swagger
 * /wallet/balance:
 *   get:
 *     summary: Get the balance of ETH or LPT for a wallet
 *     tags: [Wallet]
 *     parameters:
 *       - in: query
 *         name: walletAddress
 *         required: true
 *         schema:
 *           type: string
 *         description: The address of the wallet to fetch the balance for
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ETH, LPT]
 *         description: The token type (ETH or LPT) to fetch the balance for
 *     responses:
 *       200:
 *         description: Token balance fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balance:
 *                   type: string
 *                   description: The balance of the specified token
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Wallet address is required
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */

/**
 * GET /wallet/balance
 * Route to fetch the balance of ETH or LPT for a wallet
 */
router.get('/balance',verifyAuth, (req, res) => walletController.getTokenBalance(req, res));

/**
 * GET /wallet/:walletId
 * Route to fetch a wallet by ID
 */
router.get('/:walletId',verifyAuth, (req, res) => walletController.getWalletById(req, res));

/**
 * GET /wallet/:walletId/export
 * Route to export a wallet's private key
 */
router.get('/:walletId/export',verifyAuth, (req, res) => walletController.exportWalletPrivateKey(req, res));

export default router;
