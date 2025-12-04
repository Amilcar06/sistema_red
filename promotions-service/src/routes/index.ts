import { Router } from 'express';
import productRoutes from './product.routes';
import promotionRoutes from './promotion.routes';
import ruleRoutes from './rule.routes';

const router = Router();

router.use('/promotions', promotionRoutes);
router.use('/products', productRoutes);
router.use('/rules', ruleRoutes);

export default router;
