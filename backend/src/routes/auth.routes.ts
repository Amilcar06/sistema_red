import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import authController from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { loginSchema, registerSchema } from '../utils/validators';
import { authLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refreshToken);
router.get('/me', authenticate, authController.getMe);

export default router;

