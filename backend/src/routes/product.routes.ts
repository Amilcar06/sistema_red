import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import productController from '../controllers/product.controller';
import { validate } from '../middleware/validation.middleware';
import { createProductSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router
  .route('/')
  .get(productController.findAll)
  .post(
    authorize('ADMIN', 'OPERADOR'),
    validate(createProductSchema),
    productController.create
  );

router
  .route('/:id')
  .get(productController.findById)
  .patch(authorize('ADMIN', 'OPERADOR'), productController.update)
  .delete(authorize('ADMIN'), productController.delete);

export default router;

