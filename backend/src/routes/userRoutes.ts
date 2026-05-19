import { Router } from 'express';

const router = Router();

/**
 * User routes
 * TODO: Implement user profile, wishlist, favorites, alerts
 */

router.get('/wishlist', (req, res) => {
  res.json({ message: 'Wishlist endpoint' });
});

router.get('/favorites', (req, res) => {
  res.json({ message: 'Favorites endpoint' });
});

export default router;
