import { Router } from 'express';
import userRoutes from './user.routes';
import transactionRoutes from './transaction.routes';
import { adminAuth } from '../middleware/admin.middleware';
import { adminLogin, createAdmin } from '../controllers/auth.controller';
import dashboardRoutes from './dashboard.routes';
import validatorRoutes from './validator.routes';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Admin - Users
 *     description: Admin endpoints for user management
 *   - name: Admin - Transactions
 *     description: Admin endpoints for transaction management
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
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Invalid email or password
 *       403:
 *         description: Admin account is inactive
 */
router.post('/login', adminLogin);

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

// Mount user management routes
router.use('/users', userRoutes);

// Mount dashboard routes
router.use('/dashboard', dashboardRoutes);

// Mount validator routes
router.use('/validators', validatorRoutes);

// Mount transaction management routes  
router.use('/transactions', transactionRoutes);

export default router;
