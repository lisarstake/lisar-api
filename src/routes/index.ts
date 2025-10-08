import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import orchestratorRoutes from './orchestrator.routes';
import { verifyAuth } from '../middleware/verifyAuth';
import delegationRoutes from './delegation.routes';
import walletRoutes from './wallet.routes';

const router = Router();

// Mount auth routes
router.use('/auth', authRoutes);

// Mount user routes with verifyAuth middleware
router.use('/users',  userRoutes);

// Mount orchestrator routes
router.use('/orchestrator', orchestratorRoutes);
router.use('/delegation', delegationRoutes);

// Mount wallet routes
router.use('/wallet', walletRoutes);

export default router;
