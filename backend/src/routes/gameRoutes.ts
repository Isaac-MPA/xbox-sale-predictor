import { Router } from 'express';
import GameController from '../controllers/gameController';
import { searchLimiter } from '../middleware/rateLimit';

const router = Router();

/**
 * GET /api/games - Get all games
 */
router.get('/', GameController.getAllGames);

/**
 * GET /api/games/search - Search games
 */
router.get('/search', searchLimiter, GameController.searchGames);

/**
 * GET /api/games/genre/:genre - Get games by genre
 */
router.get('/genre/:genre', GameController.getGamesByGenre);

/**
 * GET /api/games/:id - Get game by ID
 */
router.get('/:id', GameController.getGameById);

/**
 * GET /api/games/:id/price-history - Get price history
 */
router.get('/:id/price-history', GameController.getPriceHistory);

/**
 * GET /api/games/:id/price-stats - Get price statistics
 */
router.get('/:id/price-stats', GameController.getPriceStats);

export default router;
