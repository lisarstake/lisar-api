import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import { verifyAuth } from '../middleware/verifyAuth';

const router = Router();

// Mount auth routes
router.use('/auth', authRoutes);

// Mount user routes with verifyAuth middleware
router.use('/users',  userRoutes);

export default router;
