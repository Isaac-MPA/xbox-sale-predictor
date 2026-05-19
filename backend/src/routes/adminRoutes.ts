import { Router } from 'express';
import { verifyToken, isAdmin } from '../middleware/auth';

const router = Router();

/**
 * Admin routes
 * All admin routes require authentication and admin role
 */

router.use(verifyToken, isAdmin);

/**
 * GET /api/admin/dashboard - Get admin dashboard data
 */
router.get('/dashboard', (req, res) => {
  res.json({
    success: true,
    message: 'Admin dashboard data',
  });
});

/**
 * POST /api/admin/sync - Trigger data sync
 */
router.post('/sync', (req, res) => {
  res.json({
    success: true,
    message: 'Sync triggered',
  });
});

export default router;
