import { Request, Response } from 'express';
import PredictionService from '../services/predictionService';
import logger from '../utils/logger';

/**
 * Prediction Controller - Handles prediction-related requests
 */
export class PredictionController {
  /**
   * Get prediction for a game
   */
  static async getPrediction(req: Request, res: Response): Promise<void> {
    const { gameId } = req.params;

    const prediction = await PredictionService.getPrediction(gameId);
    res.status(200).json({
      success: true,
      data: prediction,
    });
  }

  /**
   * Calculate/recalculate prediction for a game
   */
  static async calculatePrediction(req: Request, res: Response): Promise<void> {
    const { gameId } = req.params;

    const prediction = await PredictionService.calculatePrediction(gameId);
    res.status(200).json({
      success: true,
      message: 'Prediction calculated successfully',
      data: prediction,
    });
  }

  /**
   * Get upcoming sales
   */
  static async getUpcomingSales(req: Request, res: Response): Promise<void> {
    const limit = parseInt(req.query.limit as string) || 10;

    const upcomingSales = await PredictionService.getUpcomingSales(limit);
    res.status(200).json({
      success: true,
      data: upcomingSales,
    });
  }
}

export default PredictionController;
