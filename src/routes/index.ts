import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';

const router = Router();

// Mount auth routes
router.use('/auth', authRoutes);

// Mount user routes
router.use('/users', userRoutes);

export default router;
