import prisma from '../utils/prisma';
import logger from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { findAveragePrice, findMedianPrice, calculatePercentageChange } from '../utils/helpers';

interface PriceHistoryData {
  gameId: string;
  price: number;
  discount?: number;
  date: Date;
}

/**
 * Price Service - Handles price history and tracking
 */
export class PriceService {
  /**
   * Record a price for a game
   */
  static async recordPrice(data: PriceHistoryData) {
    try {
      const priceRecord = await prisma.priceHistory.create({
        data: {
          gameId: data.gameId,
          price: data.price,
          discount: data.discount || 0,
          date: data.date || new Date(),
        },
      });

      logger.info(`Price recorded for game ${data.gameId}: $${data.price}`);
      return priceRecord;
    } catch (error) {
      logger.error('Error recording price:', error);
      throw new AppError(500, 'Failed to record price');
    }
  }

  /**
   * Get price history for a game
   */
  static async getPriceHistory(gameId: string, days: number = 365) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const priceHistory = await prisma.priceHistory.findMany({
        where: {
          gameId,
          date: {
            gte: startDate,
          },
        },
        orderBy: { date: 'asc' },
      });

      return priceHistory;
    } catch (error) {
      logger.error('Error fetching price history:', error);
      throw new AppError(500, 'Failed to fetch price history');
    }
  }

  /**
   * Get price statistics for a game
   */
  static async getPriceStats(gameId: string) {
    try {
      const priceHistory = await prisma.priceHistory.findMany({
        where: { gameId },
        orderBy: { date: 'desc' },
      });

      if (priceHistory.length === 0) {
        throw new AppError(404, 'No price history found');
      }

      const prices = priceHistory.map((p) => p.price);
      const discounts = priceHistory.filter((p) => p.discount > 0).map((p) => p.discount);

      const currentPrice = prices[0];
      const lowestPrice = Math.min(...prices);
      const highestPrice = Math.max(...prices);
      const averagePrice = findAveragePrice(prices);
      const medianPrice = findMedianPrice(prices);
      const avgDiscount = discounts.length > 0 ? findAveragePrice(discounts) : 0;

      // Calculate frequency of discounts
      const discountFrequency = (discounts.length / priceHistory.length) * 100;

      // Calculate time between discounts
      const saleDates = priceHistory
        .filter((p) => p.discount > 0)
        .map((p) => p.date.getTime())
        .sort((a, b) => b - a);

      let avgDaysBetweenSales = 0;
      if (saleDates.length > 1) {
        const diffs = [];
        for (let i = 0; i < saleDates.length - 1; i++) {
          diffs.push((saleDates[i] - saleDates[i + 1]) / (1000 * 60 * 60 * 24));
        }
        avgDaysBetweenSales = findAveragePrice(diffs);
      }

      return {
        currentPrice,
        lowestPrice,
        highestPrice,
        averagePrice,
        medianPrice,
        averageDiscount: avgDiscount,
        discountFrequency,
        avgDaysBetweenSales,
        totalRecords: priceHistory.length,
      };
    } catch (error) {
      logger.error('Error calculating price stats:', error);
      throw error instanceof AppError ? error : new AppError(500, 'Failed to calculate stats');
    }
  }

  /**
   * Get current price for a game
   */
  static async getCurrentPrice(gameId: string) {
    try {
      const latestPrice = await prisma.priceHistory.findFirst({
        where: { gameId },
        orderBy: { date: 'desc' },
      });

      if (!latestPrice) {
        throw new AppError(404, 'No price data found');
      }

      return latestPrice;
    } catch (error) {
      logger.error('Error fetching current price:', error);
      throw error instanceof AppError ? error : new AppError(500, 'Failed to fetch price');
    }
  }

  /**
   * Update price for a game (used by sync job)
   */
  static async updateGamePrice(gameId: string, price: number, discount: number = 0) {
    try {
      // Check if price already exists for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingPrice = await prisma.priceHistory.findFirst({
        where: {
          gameId,
          date: {
            gte: today,
          },
        },
      });

      if (existingPrice && existingPrice.price === price) {
        return existingPrice; // No change
      }

      return await this.recordPrice({
        gameId,
        price,
        discount,
        date: new Date(),
      });
    } catch (error) {
      logger.error('Error updating game price:', error);
      throw new AppError(500, 'Failed to update price');
    }
  }
}

export default PriceService;
