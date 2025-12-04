import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import promotionController from '../controllers/promotion.controller';
import { validate } from '../middleware/validation.middleware';
import { createPromotionSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router
  .route('/')
  .get(promotionController.findAll)
  .post(
    authorize('ADMIN', 'OPERADOR'),
    validate(createPromotionSchema),
    promotionController.create
  );

router.post('/:id/activate', authorize('ADMIN', 'OPERADOR'), promotionController.activate);
router.post('/:id/pause', authorize('ADMIN', 'OPERADOR'), promotionController.pause);
router.get('/segments', promotionController.getSegments);
router.get('/statuses', promotionController.getStatuses);
router.get('/:id/statistics', promotionController.getStatistics);
router.post('/:id/launch', authorize('ADMIN', 'OPERADOR'), promotionController.launch);

router
  .route('/:id')
  .get(promotionController.findById)
  .patch(authorize('ADMIN', 'OPERADOR'), promotionController.update)
  .delete(authorize('ADMIN'), promotionController.delete);

export default router;

