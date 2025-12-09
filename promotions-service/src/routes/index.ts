import { Router } from 'express';
import productRoutes from './product.routes';
import promotionRoutes from './promotion.routes';
import ruleRoutes from './rule.routes';

import reportsRoutes from './reports.routes';

const router = Router();

router.use('/promotions', promotionRoutes);
router.use('/products', productRoutes);
router.use('/rules', ruleRoutes);
router.use('/reports', reportsRoutes);

export default router;
