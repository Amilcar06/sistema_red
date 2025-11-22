import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import notificationController from '../controllers/notification.controller';
import { validate } from '../middleware/validation.middleware';
import { sendNotificationSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.post(
  '/send',
  authorize('ADMIN', 'OPERADOR'),
  validate(sendNotificationSchema),
  notificationController.send
);

router.post(
  '/bulk',
  authorize('ADMIN', 'OPERADOR'),
  notificationController.sendBulk
);

router.get('/history', notificationController.getHistory);

export default router;

