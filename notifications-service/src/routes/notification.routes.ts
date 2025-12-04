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
  '/send-batch',
  authorize('ADMIN', 'OPERADOR'),
  notificationController.sendBatch
);

router.get('/history', notificationController.getHistory);
router.get('/statuses', notificationController.getStatuses);

export default router;

