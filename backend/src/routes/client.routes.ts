import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import clientController from '../controllers/client.controller';
import { validate } from '../middleware/validation.middleware';
import {
  createClientSchema,
  updateClientSchema,
} from '../utils/validators';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

router
  .route('/')
  .get(clientController.findAll)
  .post(
    authorize('ADMIN', 'OPERADOR'),
    validate(createClientSchema),
    clientController.create
  );

router.get('/statistics', clientController.getStatistics);

router
  .route('/:id')
  .get(clientController.findById)
  .patch(
    authorize('ADMIN', 'OPERADOR'),
    validate(updateClientSchema),
    clientController.update
  )
  .delete(authorize('ADMIN'), clientController.delete);

export default router;

