import { Router } from 'express';
import { transactionController } from '../controllers/transaction.controller';
import { verifyAuth } from '../middleware/verifyAuth';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         user_id:
 *           type: string
 *           example: "user123"
 *         transaction_hash:
 *           type: string
 *           example: "0x5404075aae89bf843cb30d5e92362382ff4d9696d3e568e38426c4ab110e1e18"
 *         transaction_type:
 *           type: string
 *           enum: [deposit, withdrawal, delegation, undelegation]
 *           example: "deposit"
 *         amount:
 *           type: string
 *           example: "0.1"
 *         token_address:
 *           type: string
 *           example: "0x289ba1701c2f088cf0faf8b3705246331cb8a839"
 *         token_symbol:
 *           type: string
 *           example: "LPT"
 *         wallet_address:
 *           type: string
 *           example: "0xbbbc7b00dceccb59fd00ac6cbc91c5298ad6a369"
 *         wallet_id:
 *           type: string
 *           example: "z10zggo1fl16do8lk7w3rx7c"
 *         status:
 *           type: string
 *           enum: [pending, confirmed, failed]
 *           example: "confirmed"
 *         source:
 *           type: string
 *           enum: [privy_webhook, manual, api, delegation_api]
 *           example: "privy_webhook"
 *         svix_id:
 *           type: string
 *           example: "msg_340cDtMMPPpHJT9oToAJMxRJLWp"
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2023-10-08T10:30:00Z"
 */

/**
 * @swagger
 * /transactions/user/{userId}:
 *   get:
 *     summary: Get all transactions for a user
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Maximum number of transactions to return
 *     responses:
 *       200:
 *         description: Successfully retrieved transactions
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
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *                 count:
 *                   type: integer
 *                   example: 5
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get('/user/:userId', verifyAuth, transactionController.getUserTransactions.bind(transactionController));

/**
 * @swagger
 * /transactions/{transactionId}:
 *   get:
 *     summary: Get a specific transaction by ID
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The transaction ID
 *     responses:
 *       200:
 *         description: Successfully retrieved transaction
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Internal server error
 */
router.get('/:transactionId', verifyAuth, transactionController.getTransactionById.bind(transactionController));

/**
 * @swagger
 * /transactions/hash/{transactionHash}:
 *   get:
 *     summary: Get transaction by blockchain hash
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionHash
 *         required: true
 *         schema:
 *           type: string
 *         description: The blockchain transaction hash
 *     responses:
 *       200:
 *         description: Successfully retrieved transaction
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Internal server error
 */
router.get('/hash/:transactionHash', verifyAuth, transactionController.getTransactionByHash.bind(transactionController));

/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Create a new transaction record
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - transaction_hash
 *               - transaction_type
 *               - amount
 *               - status
 *               - source
 *             properties:
 *               user_id:
 *                 type: string
 *                 example: "user123"
 *               transaction_hash:
 *                 type: string
 *                 example: "0x5404075aae89bf843cb30d5e92362382ff4d9696d3e568e38426c4ab110e1e18"
 *               transaction_type:
 *                 type: string
 *                 enum: [deposit, withdrawal, delegation, undelegation]
 *                 example: "deposit"
 *               amount:
 *                 type: string
 *                 example: "0.1"
 *               token_address:
 *                 type: string
 *                 example: "0x289ba1701c2f088cf0faf8b3705246331cb8a839"
 *               token_symbol:
 *                 type: string
 *                 example: "LPT"
 *               wallet_address:
 *                 type: string
 *                 example: "0xbbbc7b00dceccb59fd00ac6cbc91c5298ad6a369"
 *               wallet_id:
 *                 type: string
 *                 example: "z10zggo1fl16do8lk7w3rx7c"
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, failed]
 *                 example: "confirmed"
 *               source:
 *                 type: string
 *                 enum: [privy_webhook, manual, api, delegation_api]
 *                 example: "delegation_api"
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Bad request - missing required fields
 *       500:
 *         description: Internal server error
 */
router.post('/', verifyAuth, transactionController.createTransaction.bind(transactionController));

/**
 * @swagger
 * /transactions/{transactionId}/status:
 *   patch:
 *     summary: Update transaction status
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The transaction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, failed]
 *                 example: "confirmed"
 *     responses:
 *       200:
 *         description: Transaction status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:transactionId/status', verifyAuth, transactionController.updateTransactionStatus.bind(transactionController));

/**
 * @swagger
 * /transactions/user/{userId}/type/{type}:
 *   get:
 *     summary: Get user transactions by type
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's ID
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [deposit, withdrawal, delegation, undelegation]
 *         description: The transaction type
 *     responses:
 *       200:
 *         description: Successfully retrieved transactions
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
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *                 count:
 *                   type: integer
 *                   example: 3
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get('/user/:userId/type/:type', verifyAuth, transactionController.getUserTransactionsByType.bind(transactionController));

export default router;
