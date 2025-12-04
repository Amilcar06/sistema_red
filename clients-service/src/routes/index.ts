import { Router } from 'express';
import authRoutes from './auth.routes';
import clientRoutes from './client.routes';
import settingsRoutes from './settings.routes';

import dashboardRoutes from './dashboard.routes';
import reportsRoutes from './reports.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/clients', clientRoutes);
router.use('/settings', settingsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportsRoutes);

export default router;
