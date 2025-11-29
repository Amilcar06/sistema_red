import { Router } from 'express';
import authRoutes from './auth.routes';
import clientRoutes from './client.routes';
import productRoutes from './product.routes';
import promotionRoutes from './promotion.routes';
import notificationRoutes from './notification.routes';
import ruleRoutes from './rule.routes';

import settingsRoutes from './settings.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/clients', clientRoutes);
router.use('/promotions', promotionRoutes);
router.use('/products', productRoutes);
router.use('/notifications', notificationRoutes);
router.use('/rules', ruleRoutes);
router.use('/settings', settingsRoutes);

export default router;
