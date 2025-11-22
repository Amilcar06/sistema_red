import { Router } from 'express';
import authRoutes from './auth.routes';
import clientRoutes from './client.routes';
import productRoutes from './product.routes';
import promotionRoutes from './promotion.routes';
import notificationRoutes from './notification.routes';
import ruleRoutes from './rule.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/clients', clientRoutes);
router.use('/products', productRoutes);
router.use('/promotions', promotionRoutes);
router.use('/notifications', notificationRoutes);
router.use('/rules', ruleRoutes);

export default router;

