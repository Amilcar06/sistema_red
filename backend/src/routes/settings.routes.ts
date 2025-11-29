import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Solo administradores pueden ver y modificar configuraciones
router.get('/', authorize('ADMIN'), getSettings);
router.put('/', authorize('ADMIN'), updateSettings);

export default router;
