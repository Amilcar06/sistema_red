import { Router } from 'express';
import reportsController from '../controllers/reports.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/dashboard', reportsController.getDashboardReport);

export default router;
