import { Router } from 'express';
import { validatorController } from '../controllers/validator.controller';
import { adminAuth } from '../middleware/admin.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Admin - Validators
 *     description: Manage validators (orchestrators)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Validator:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         address:
 *           type: string
 *         name:
 *           type: string
 *         protocol:
 *           type: string
 *         fee_pct:
 *           type: number
 *         apy:
 *           type: number
 *         total_delegated_lisar:
 *           type: string
 *         is_active:
 *           type: boolean
 *         created_date:
 *           type: string
 *         updated_date:
 *           type: string
 */

/**
 * @swagger
 * /admin/validators:
 *   get:
 *     summary: List validators
 *     tags: [Admin - Validators]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by address or name
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, hidden]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of validators
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     validators:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Validator'
 */
router.get('/', adminAuth, validatorController.list);

/**
 * @swagger
 * /admin/validators:
 *   post:
 *     summary: Create a validator
 *     tags: [Admin - Validators]
 *     security:
 *       - adminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               protocol:
 *                 type: string
 *                 example: livepeer
 *               fee_pct:
 *                 type: number
 *               apy:
 *                 type: number
 *     responses:
 *       201:
 *         description: Validator created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Validator'
 */
router.post('/', adminAuth, validatorController.create);

/**
 * @swagger
 * /admin/validators/{id}:
 *   get:
 *     summary: Get validator by id
 *     tags: [Admin - Validators]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Validator object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Validator'
 */
router.get('/:id', adminAuth, validatorController.getById);

/**
 * @swagger
 * /admin/validators/{id}:
 *   patch:
 *     summary: Update validator
 *     tags: [Admin - Validators]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               fee_pct:
 *                 type: number
 *               apy:
 *                 type: number
 *               protocol:
 *                 type: string
 *     responses:
 *       200:
 *         description: Validator updated
 */
router.patch('/:id', adminAuth, validatorController.update);

/**
 * @swagger
 * /admin/validators/{id}/status:
 *   patch:
 *     summary: Update validator visibility status
 *     tags: [Admin - Validators]
 *     security:
 *       - adminAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Validator status updated
 */
router.patch('/:id/status', adminAuth, validatorController.setStatus);

export default router;
