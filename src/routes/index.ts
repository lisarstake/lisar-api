import { Router } from 'express';
import authRoutes from './auth.routes';
// import userRoutes from './user.routes'; // We'll add this later

const router = Router();

// Mount auth routes
router.use('/auth', authRoutes);

// Mount user routes (coming next)
// router.use('/users', userRoutes);

export default router;
