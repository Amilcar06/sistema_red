import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import ruleController from '../controllers/rule.controller';
import { validate } from '../middleware/validation.middleware';
import { createRuleSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router
  .route('/')
  .get(ruleController.findAll)
  .post(
    authorize('ADMIN', 'OPERADOR'),
    validate(createRuleSchema),
    ruleController.create
  );

router.post('/assign', authorize('ADMIN', 'OPERADOR'), ruleController.assignToPromotion);
router.get('/types', ruleController.getTypes);
router.get('/evaluate/:clienteId/:promocionId', ruleController.evaluateEligibility);

router
  .route('/:id')
  .get(ruleController.findById)
  .patch(authorize('ADMIN', 'OPERADOR'), ruleController.update)
  .delete(authorize('ADMIN'), ruleController.delete);

export default router;

