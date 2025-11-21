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
 * POST /wallet/send-lpt
 * Route to send LPT from a Privy-managed wallet to another address
 */
router.post('/send-lpt', verifyAuth, (req, res) => walletController.sendLPT(req, res));

/**
 * @swagger
 * /wallet/send-lpt:
 *   post:
 *     summary: Send LPT from a Privy-managed wallet to another address
 *     tags: [Wallet]
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
 *               - to
 *               - amount
 *             properties:
 *               walletId:
 *                 type: string
 *                 example: "z10zggo1fl16do8lk7w3rx7c"
 *               walletAddress:
 *                 type: string
 *                 example: "0xabc..."
 *               to:
 *                 type: string
 *                 example: "0xdef..."
 *               amount:
 *                 type: string
 *                 example: "1.5"
 *     responses:
 *       200:
 *         description: LPT transfer initiated successfully
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
 *                   example: "0x5404075aae89bf843cb30d5e92362382ff4d9696d3e568e38426c4ab110e1e18"
 *       400:
 *         description: Bad request - missing or invalid fields
 *       401:
 *         description: Unauthorized - missing or invalid bearer token
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /wallet/approve-lpt:
 *   post:
 *     summary: Approve LPT allowance for a spender from a Privy-managed wallet
 *     tags: [Wallet]
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
 *               - spender
 *               - amount
 *             properties:
 *               walletId:
 *                 type: string
 *                 example: "z10zggo1fl16do8lk7w3rx7c"
 *               walletAddress:
 *                 type: string
 *                 example: "0xabc..."
 *               spender:
 *                 type: string
 *                 example: "0xdef..."
 *               amount:
 *                 type: string
 *                 example: "1000000000000000000"
 *     responses:
 *       200:
 *         description: Approval transaction initiated successfully
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
 *                   example: "0x5404075aae89bf843cb30d5e92362382ff4d9696d3e568e38426c4ab110e1e18"
 *       400:
 *         description: Bad request - missing or invalid fields
 *       401:
 *         description: Unauthorized - missing or invalid bearer token
 *       500:
 *         description: Internal server error
 */

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
