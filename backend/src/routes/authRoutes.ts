import { Router } from 'express';
import AuthController from '../controllers/authController';
import { verifyToken } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimit';

const router = Router();

/**
 * POST /api/auth/register - Register new user
 */
router.post('/register', authLimiter, AuthController.register);

/**
 * POST /api/auth/login - Login user
 */
router.post('/login', authLimiter, AuthController.login);

/**
 * GET /api/auth/me - Get current user
 */
router.get('/me', verifyToken, AuthController.getCurrentUser);

export default router;
