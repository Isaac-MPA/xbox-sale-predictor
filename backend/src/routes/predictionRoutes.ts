import { Router } from 'express';
import PredictionController from '../controllers/predictionController';

const router = Router();

/**
 * GET /api/predictions/upcoming - Get upcoming sales
 */
router.get('/upcoming', PredictionController.getUpcomingSales);

/**
 * GET /api/predictions/:gameId - Get prediction for a game
 */
router.get('/:gameId', PredictionController.getPrediction);

/**
 * POST /api/predictions/:gameId/calculate - Calculate prediction
 */
router.post('/:gameId/calculate', PredictionController.calculatePrediction);

export default router;
