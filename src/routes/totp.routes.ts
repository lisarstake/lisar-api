import { Router } from 'express';
import { totpController } from '../controllers/totp.controller';
import { verifyAuth } from '../middleware/verifyAuth';
// import { verifyAuth } from '../middleware/verifyAuth'; // Uncomment if you want to protect these routes

const router = Router();
/**
 * @openapi
 * /totp/setup:
 *   post:
 *     summary: Generate TOTP secret and QR code for 2FA setup
 *     description: |
 *       Generates a TOTP secret and QR code for the authenticated user. The issuer is always 'Lisar' and the name is the user's email fetched from the database. No request body is required.
 *     tags:
 *       - TOTP
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: false
 *     responses:
 *       200:
 *         description: QR code and otpauth URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 qr:
 *                   type: string
 *                   description: Data URL for QR code
 *                 otpauth_url:
 *                   type: string
 *                   description: otpauth URL (issuer is 'Lisar', name is user's email)
 *       401:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/setup', verifyAuth, totpController.setup);

/**
 * @openapi
 * /totp/verify:
 *   post:
 *     summary: Verify TOTP code and enable 2FA
 *     tags:
 *       - TOTP
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: '123456'
 *     responses:
 *       200:
 *         $ref: '#/components/schemas/Success'
 *       400:
 *         $ref: '#/components/schemas/Error'
 */
router.post('/verify', verifyAuth, totpController.verify);

/**
 * @openapi
 * /totp/validate:
 *   post:
 *     summary: Validate TOTP code during login
 *     tags:
 *       - TOTP
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: '123456'
 *     responses:
 *       200:
 *         $ref: '#/components/schemas/Success'
 *       400:
 *         $ref: '#/components/schemas/Error'
 */
router.post('/validate', verifyAuth, totpController.validate);

export default router;
