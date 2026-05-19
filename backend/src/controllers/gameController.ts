import { Request, Response } from 'express';
import GameService from '../services/gameService';
import PriceService from '../services/priceService';
import logger from '../utils/logger';

/**
 * Game Controller - Handles game-related requests
 */
export class GameController {
  /**
   * Get all games with pagination
   */
  static async getAllGames(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await GameService.getAllGames(page, limit);
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }

  /**
   * Get game by ID
   */
  static async getGameById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const game = await GameService.getGameById(id);

    res.status(200).json({
      success: true,
      data: game,
    });
  }

  /**
   * Search games by title
   */
  static async searchGames(req: Request, res: Response): Promise<void> {
    const query = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!query || query.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
      return;
    }

    const games = await GameService.searchGames(query, limit);
    res.status(200).json({
      success: true,
      data: games,
    });
  }

  /**
   * Get games by genre
   */
  static async getGamesByGenre(req: Request, res: Response): Promise<void> {
    const { genre } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await GameService.getGamesByGenre(genre, page, limit);
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }

  /**
   * Get price history for a game
   */
  static async getPriceHistory(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const days = parseInt(req.query.days as string) || 365;

    const priceHistory = await PriceService.getPriceHistory(id, days);
    res.status(200).json({
      success: true,
      data: priceHistory,
    });
  }

  /**
   * Get price statistics for a game
   */
  static async getPriceStats(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const stats = await PriceService.getPriceStats(id);
    res.status(200).json({
      success: true,
      data: stats,
    });
  }
}

export default GameController;
