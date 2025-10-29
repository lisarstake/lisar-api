import { Router } from 'express';
import { adminTransactionController } from '../controllers/transaction.controller';
import { adminAuth, requireAdmin } from '../middleware/admin.middleware';

const router = Router();

// All routes require admin authentication
router.use(adminAuth);

/**
 * @swagger
 * components:
 *   schemas:
 *     AdminTransaction:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         user_id:
 *           type: string
 *         transaction_hash:
 *           type: string
 *         transaction_type:
 *           type: string
 *           enum: [deposit, withdrawal, delegation, undelegation]
 *         amount:
 *           type: string
 *         token_address:
 *           type: string
 *         token_symbol:
 *           type: string
 *         wallet_address:
 *           type: string
 *         wallet_id:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, confirmed, failed]
 *         source:
 *           type: string
 *           enum: [privy_webhook, manual, api, delegation_api]
 *         svix_id:
 *           type: string
 *         created_at:
 *           type: string
 */

/**
 * @swagger
 * /admin/transactions/stats:
 *   get:
 *     summary: Get transaction statistics
 *     tags: [Admin - Transactions]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for statistics
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for statistics
 *     responses:
 *       200:
 *         description: Transaction statistics retrieved successfully
 */
router.get('/stats', requireAdmin, adminTransactionController.getTransactionStats);

/**
 * @swagger
 * /admin/transactions/failed:
 *   get:
 *     summary: Get failed transactions
 *     tags: [Admin - Transactions]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of failed transactions to retrieve
 *     responses:
 *       200:
 *         description: Failed transactions retrieved successfully
 */
router.get('/failed', requireAdmin, adminTransactionController.getFailedTransactions);

/**
 * @swagger
 * /admin/transactions/pending:
 *   get:
 *     summary: Get pending transactions that need attention
 *     tags: [Admin - Transactions]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: query
 *         name: olderThanMinutes
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Get pending transactions older than this many minutes
 *     responses:
 *       200:
 *         description: Pending transactions retrieved successfully
 */
router.get('/pending', requireAdmin, adminTransactionController.getPendingTransactions);

/**
 * @swagger
 * /admin/transactions:
 *   get:
 *     summary: Get all transactions with filters and pagination
 *     tags: [Admin - Transactions]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of transactions per page
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, failed, all]
 *         description: Filter by transaction status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [deposit, withdrawal, delegation, undelegation, all]
 *         description: Filter by transaction type
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           enum: [privy_webhook, manual, api, delegation_api, all]
 *         description: Filter by transaction source
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter transactions from this date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter transactions to this date
 *       - in: query
 *         name: minAmount
 *         schema:
 *           type: number
 *         description: Filter by minimum amount
 *       - in: query
 *         name: maxAmount
 *         schema:
 *           type: number
 *         description: Filter by maximum amount
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by transaction hash, wallet address, or user ID
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [created_at, amount, status]
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 */
router.get('/', requireAdmin, adminTransactionController.getTransactions);

/**
 * @swagger
 * /admin/transactions/{transactionId}:
 *   get:
 *     summary: Get transaction details by ID
 *     tags: [Admin - Transactions]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction details retrieved successfully
 *       404:
 *         description: Transaction not found
 */
router.get('/:transactionId', requireAdmin, adminTransactionController.getTransactionDetails);

/**
 * @swagger
 * /admin/transactions/{transactionId}/status:
 *   patch:
 *     summary: Update transaction status
 *     tags: [Admin - Transactions]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
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
 *                 description: New transaction status
 *               notes:
 *                 type: string
 *                 description: Optional notes for the status change
 *     responses:
 *       200:
 *         description: Transaction status updated successfully
 *       400:
 *         description: Bad request
 */
router.patch('/:transactionId/status', requireAdmin, adminTransactionController.updateTransactionStatus);

/**
 * @swagger
 * /admin/users/{userId}/transactions:
 *   get:
 *     summary: Get transactions for a specific user
 *     tags: [Admin - Transactions]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of transactions per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, failed, all]
 *         description: Filter by transaction status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [deposit, withdrawal, delegation, undelegation, all]
 *         description: Filter by transaction type
 *     responses:
 *       200:
 *         description: User transactions retrieved successfully
 *       400:
 *         description: Bad request
 */
router.get('/users/:userId/transactions', requireAdmin, adminTransactionController.getUserTransactions);

export default router;
