import { Router } from 'express';
import { getStatus, sendMessage } from '../controllers/whatsapp.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/status', authorize('ADMIN', 'OPERADOR'), getStatus);
router.post('/send', authorize('ADMIN', 'OPERADOR'), sendMessage);

export default router;
