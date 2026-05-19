import prisma from '../utils/prisma';
import logger from '../utils/logger';
import { axiosInstance } from '../utils/axios';
import { AppError } from '../middleware/errorHandler';

interface GameData {
  title: string;
  description?: string;
  coverArt?: string;
  genre?: string;
  publisher?: string;
  developer?: string;
  releaseDate?: Date;
  currentPrice: number;
  xboxStoreUrl: string;
  xboxGameId: string;
}

/**
 * Game Service - Handles all game-related database operations
 */
export class GameService {
  /**
   * Create a new game
   */
  static async createGame(data: GameData) {
    try {
      // Check if game already exists
      const existingGame = await prisma.game.findUnique({
        where: { xboxGameId: data.xboxGameId },
      });

      if (existingGame) {
        logger.warn(`Game ${data.title} already exists`);
        return existingGame;
      }

      const game = await prisma.game.create({
        data: {
          title: data.title,
          description: data.description || '',
          coverArt: data.coverArt || '',
          genre: data.genre || 'Unknown',
          publisher: data.publisher || 'Unknown',
          developer: data.developer || 'Unknown',
          releaseDate: data.releaseDate,
          xboxStoreUrl: data.xboxStoreUrl,
          xboxGameId: data.xboxGameId,
        },
      });

      logger.info(`Game created: ${game.title}`);
      return game;
    } catch (error) {
      logger.error('Error creating game:', error);
      throw new AppError(500, 'Failed to create game');
    }
  }

  /**
   * Get all games with pagination
   */
  static async getAllGames(page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;

      const [games, total] = await Promise.all([
        prisma.game.findMany({
          skip,
          take: limit,
          include: {
            priceHistory: {
              orderBy: { date: 'desc' },
              take: 1,
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.game.count(),
      ]);

      return {
        data: games,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error fetching games:', error);
      throw new AppError(500, 'Failed to fetch games');
    }
  }

  /**
   * Get game by ID
   */
  static async getGameById(id: string) {
    try {
      const game = await prisma.game.findUnique({
        where: { id },
        include: {
          priceHistory: {
            orderBy: { date: 'desc' },
          },
          predictions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      if (!game) {
        throw new AppError(404, 'Game not found');
      }

      return game;
    } catch (error) {
      logger.error('Error fetching game:', error);
      throw error instanceof AppError ? error : new AppError(500, 'Failed to fetch game');
    }
  }

  /**
   * Search games by title
   */
  static async searchGames(query: string, limit: number = 10) {
    try {
      const games = await prisma.game.findMany({
        where: {
          title: {
            contains: query,
            mode: 'insensitive',
          },
        },
        take: limit,
        select: {
          id: true,
          title: true,
          coverArt: true,
          genre: true,
          priceHistory: {
            orderBy: { date: 'desc' },
            take: 1,
            select: { price: true, date: true },
          },
        },
      });

      return games;
    } catch (error) {
      logger.error('Error searching games:', error);
      throw new AppError(500, 'Failed to search games');
    }
  }

  /**
   * Get games by genre
   */
  static async getGamesByGenre(genre: string, page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;

      const games = await prisma.game.findMany({
        where: {
          genre: {
            contains: genre,
            mode: 'insensitive',
          },
        },
        skip,
        take: limit,
        include: {
          priceHistory: {
            orderBy: { date: 'desc' },
            take: 1,
          },
        },
      });

      const total = await prisma.game.count({
        where: { genre: { contains: genre, mode: 'insensitive' } },
      });

      return {
        data: games,
        pagination: { total, page, pages: Math.ceil(total / limit) },
      };
    } catch (error) {
      logger.error('Error fetching games by genre:', error);
      throw new AppError(500, 'Failed to fetch games');
    }
  }

  /**
   * Update game
   */
  static async updateGame(id: string, data: Partial<GameData>) {
    try {
      const game = await prisma.game.update({
        where: { id },
        data,
      });

      logger.info(`Game updated: ${game.title}`);
      return game;
    } catch (error) {
      logger.error('Error updating game:', error);
      throw new AppError(500, 'Failed to update game');
    }
  }

  /**
   * Delete game
   */
  static async deleteGame(id: string) {
    try {
      // Delete related data
      await prisma.priceHistory.deleteMany({ where: { gameId: id } });
      await prisma.prediction.deleteMany({ where: { gameId: id } });

      const game = await prisma.game.delete({
        where: { id },
      });

      logger.info(`Game deleted: ${game.title}`);
      return game;
    } catch (error) {
      logger.error('Error deleting game:', error);
      throw new AppError(500, 'Failed to delete game');
    }
  }
}

export default GameService;
