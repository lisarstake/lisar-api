import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import orchestratorRoutes from './orchestrator.routes';
import { verifyAuth } from '../middleware/verifyAuth';
import delegationRoutes from './delegation.routes';
import walletRoutes from './wallet.routes';
import webhookRoutes from './webhook.routes';
import transactionRoutes from './transaction.routes';
import adminRoutes from '../admin/routes';
import protocolRoutes from './protocol.routes';
import earnerRoutes from './earner.routes';

const router = Router();

// Mount auth routes
router.use('/auth', authRoutes);

// Mount user routes with verifyAuth middleware
router.use('/users',  userRoutes);

// Mount orchestrator routes
router.use('/orchestrator', orchestratorRoutes);
router.use('/delegation', delegationRoutes);
router.use('/webhooks', webhookRoutes);

// Mount wallet routes
router.use('/wallet', walletRoutes);

// Mount earner routes
router.use('/earners', earnerRoutes);

// Protocol
router.use('/protocol', protocolRoutes);

// Mount transaction routes
router.use('/transactions', transactionRoutes);

// Mount admin routes
router.use('/admin', adminRoutes);

export default router;
