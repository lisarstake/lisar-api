import { Router } from 'express';
import userRoutes from './user.routes';
import transactionRoutes from './transaction.routes';
import jobRoutes from './job.routes';
import onramperRoutes from './onramper.routes';
import blogRoutes from './blog.routes';
import { adminAuth } from '../middleware/admin.middleware';
import { 
  adminLogin, 
  createAdmin, 
  refreshToken, 
  revokeRefreshToken,
  requestPasswordReset,
  verifyResetToken,
  resetPassword
} from '../controllers/auth.controller';
import dashboardRoutes from './dashboard.routes';
import validatorRoutes from './validator.routes';
import gasRoutes from './gas.routes';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Admin - Users
 *     description: Admin endpoints for user management
 *   - name: Admin - Transactions
 *     description: Admin endpoints for transaction management
 *   - name: Admin - Onramper
 *     description: Admin endpoints for Onramper settings management
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     adminAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Admin authentication token required
 */

// Health check for admin panel
/**
 * @swagger
 * /admin/health:
 *   get:
 *     summary: Admin panel health check
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Admin panel is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'LISAR Admin Panel is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Admin authentication info endpoint
/**
 * @swagger
 * /admin/me:
 *   get:
 *     summary: Get current admin information
 *     tags: [Admin]
 *     security:
 *       - adminAuth: []
 *     responses:
 *       200:
 *         description: Admin information retrieved successfully
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
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [super_admin, admin, moderator]
 *       401:
 *         description: Authentication required
 */
router.get('/me', adminAuth, (req: any, res): void => {
  if (!req.admin) {
    res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
    return;
  }

  res.json({
    success: true,
    data: {
      id: req.admin.id,
      email: req.admin.email,
      role: req.admin.role
    }
  });
});

// Admin login route
/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 refreshToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 expiresIn:
 *                   type: number
 *                   example: 900
 *       401:
 *         description: Invalid email or password
 *       403:
 *         description: Admin account is inactive
 */
router.post('/login', adminLogin);

// Admin refresh token route
/**
 * @swagger
 * /admin/refresh:
 *   post:
 *     summary: Refresh admin access token
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: New access token generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 expiresIn:
 *                   type: number
 *                   example: 900
 *       400:
 *         description: Refresh token is required
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh', refreshToken);

// Admin revoke refresh token route
/**
 * @swagger
 * /admin/revoke:
 *   post:
 *     summary: Revoke admin refresh token (logout)
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Refresh token revoked successfully
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
 *                   example: Refresh token revoked successfully
 *       400:
 *         description: Refresh token is required
 */
router.post('/revoke', revokeRefreshToken);

// Admin creation route
/**
 * @swagger
 * /admin/create:
 *   post:
 *     summary: Create a new admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: securepassword123
 *               role:
 *                 type: string
 *                 enum: [super_admin, admin, moderator]
 *                 example: admin
 *     responses:
 *       201:
 *         description: Admin created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     is_active:
 *                       type: boolean
 *       400:
 *         description: Admin with this email already exists
 *       500:
 *         description: Internal server error
 */
router.post('/create', createAdmin);

// Admin password reset request route
/**
 * @swagger
 * /admin/password-reset/request:
 *   post:
 *     summary: Request password reset
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *     responses:
 *       200:
 *         description: Reset email sent (if account exists)
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
 *                   example: If an account exists with this email, a password reset link has been sent.
 *       400:
 *         description: Email is required
 */
router.post('/password-reset/request', requestPasswordReset);

// Admin verify reset token route
/**
 * @swagger
 * /admin/password-reset/verify:
 *   post:
 *     summary: Verify password reset token
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Token is valid
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
 *                   example: Reset token is valid
 *                 email:
 *                   type: string
 *                   example: admin@example.com
 *       401:
 *         description: Invalid or expired reset token
 */
router.post('/password-reset/verify', verifyResetToken);

// Admin reset password route
/**
 * @swagger
 * /admin/password-reset/reset:
 *   post:
 *     summary: Reset password with token
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               newPassword:
 *                 type: string
 *                 example: newSecurePassword123
 *     responses:
 *       200:
 *         description: Password reset successfully
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
 *                   example: Password has been reset successfully. Please login with your new password.
 *       400:
 *         description: Token and new password are required
 *       401:
 *         description: Invalid or expired reset token
 */
router.post('/password-reset/reset', resetPassword);

// Mount user management routes
router.use('/users', userRoutes);

// Mount dashboard routes
router.use('/dashboard', dashboardRoutes);

// Mount validator routes
router.use('/validators', validatorRoutes);

// Mount gas top-up admin route
router.use('/gas-topup', gasRoutes);

// Mount transaction management routes  
router.use('/transactions', transactionRoutes);

// Mount job management routes
router.use('/jobs', jobRoutes);

// Mount onramper management routes
router.use('/onramper', onramperRoutes);

// Mount blog/publications management routes (admin)
router.use('/publications', adminAuth, blogRoutes);

export default router;

