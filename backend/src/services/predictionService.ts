import prisma from '../utils/prisma';
import logger from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { findAveragePrice } from '../utils/helpers';

/**
 * Prediction Service - Calculates sale predictions using historical data
 */
export class PredictionService {
  /**
   * Calculate prediction for a game
   * Uses statistical analysis of historical sales data
   */
  static async calculatePrediction(gameId: string) {
    try {
      // Get game
      const game = await prisma.game.findUnique({
        where: { id: gameId },
        include: {
          priceHistory: {
            orderBy: { date: 'asc' },
          },
        },
      });

      if (!game || !game.priceHistory || game.priceHistory.length < 3) {
        throw new AppError(400, 'Insufficient price history for prediction');
      }

      // Get sales data (entries with discounts)
      const salesData = game.priceHistory.filter((p) => p.discount > 0);

      if (salesData.length < 2) {
        throw new AppError(400, 'Not enough sale history for prediction');
      }

      // Calculate metrics
      const saleIntervals = this.calculateSaleIntervals(salesData);
      const avgInterval = findAveragePrice(saleIntervals);
      const avgDiscount = findAveragePrice(salesData.map((s) => s.discount));
      const currentPrice = game.priceHistory[game.priceHistory.length - 1].price;
      const basePrice = Math.max(...game.priceHistory.map((p) => p.price));
      const lowestSalePrice = Math.min(...salesData.map((s) => s.price));

      // Calculate next sale date
      const lastSaleDate = new Date(salesData[salesData.length - 1].date);
      const nextSaleDate = new Date(lastSaleDate.getTime() + avgInterval * 24 * 60 * 60 * 1000);

      // Calculate confidence score
      const confidence = this.calculateConfidence(salesData, saleIntervals);

      // Calculate predicted price
      const predictedPrice = basePrice * (1 - avgDiscount / 100);

      // Store prediction
      const prediction = await prisma.prediction.create({
        data: {
          gameId,
          nextSaleDate,
          estimatedDiscount: avgDiscount,
          estimatedPrice: predictedPrice,
          confidence,
          saleIntervalDays: Math.round(avgInterval),
          analysisMetadata: {
            totalSales: salesData.length,
            avgInterval: Math.round(avgInterval),
            priceVolatility: this.calculateVolatility(game.priceHistory),
            seasonalPattern: this.detectSeasonalPattern(salesData),
          },
        },
      });

      logger.info(`Prediction calculated for game ${gameId}`);
      return prediction;
    } catch (error) {
      logger.error('Error calculating prediction:', error);
      throw error instanceof AppError ? error : new AppError(500, 'Failed to calculate prediction');
    }
  }

  /**
   * Calculate intervals between sales in days
   */
  private static calculateSaleIntervals(salesData: any[]): number[] {
    const intervals: number[] = [];
    for (let i = 1; i < salesData.length; i++) {
      const prevDate = new Date(salesData[i - 1].date).getTime();
      const currDate = new Date(salesData[i].date).getTime();
      const daysDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24);
      intervals.push(daysDiff);
    }
    return intervals;
  }

  /**
   * Calculate confidence score (0-100)
   * Based on consistency of sale intervals and frequency
   */
  private static calculateConfidence(salesData: any[], intervals: number[]): number {
    // Base confidence on frequency
    const frequencyScore = Math.min(salesData.length * 10, 50);

    // Calculate standard deviation of intervals
    const avgInterval = findAveragePrice(intervals);
    const variance = findAveragePrice(
      intervals.map((i) => Math.pow(i - avgInterval, 2))
    );
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / avgInterval;

    // Lower variation = higher confidence
    const consistencyScore = Math.max(0, 50 - coefficientOfVariation * 10);

    return Math.round(frequencyScore + consistencyScore);
  }

  /**
   * Calculate price volatility
   */
  private static calculateVolatility(priceHistory: any[]): number {
    if (priceHistory.length < 2) return 0;

    const prices = priceHistory.map((p) => p.price);
    const avgPrice = findAveragePrice(prices);
    const variance = findAveragePrice(
      prices.map((p) => Math.pow(p - avgPrice, 2))
    );

    return Math.round(Math.sqrt(variance) * 100) / 100;
  }

  /**
   * Detect seasonal patterns in sales
   */
  private static detectSeasonalPattern(salesData: any[]): string {
    const months = salesData.map((s) => new Date(s.date).getMonth());
    const monthCounts: { [key: number]: number } = {};

    months.forEach((m) => {
      monthCounts[m] = (monthCounts[m] || 0) + 1;
    });

    const sortedMonths = Object.entries(monthCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([month]) => parseInt(month));

    const seasonMap: { [key: number]: string } = {
      11: 'holiday',
      6: 'summer',
      3: 'spring',
      9: 'fall',
    };

    return seasonMap[sortedMonths[0]] || 'none';
  }

  /**
   * Get prediction for a game
   */
  static async getPrediction(gameId: string) {
    try {
      const prediction = await prisma.prediction.findFirst({
        where: { gameId },
        orderBy: { createdAt: 'desc' },
      });

      if (!prediction) {
        throw new AppError(404, 'No prediction found');
      }

      return prediction;
    } catch (error) {
      logger.error('Error fetching prediction:', error);
      throw error instanceof AppError ? error : new AppError(500, 'Failed to fetch prediction');
    }
  }

  /**
   * Get upcoming sales (sorted by confidence and date)
   */
  static async getUpcomingSales(limit: number = 10) {
    try {
      const upcomingSales = await prisma.prediction.findMany({
        where: {
          nextSaleDate: {
            gte: new Date(),
          },
        },
        include: {
          game: {
            select: {
              id: true,
              title: true,
              coverArt: true,
              genre: true,
            },
          },
        },
        orderBy: [
          { confidence: 'desc' },
          { nextSaleDate: 'asc' },
        ],
        take: limit,
      });

      return upcomingSales;
    } catch (error) {
      logger.error('Error fetching upcoming sales:', error);
      throw new AppError(500, 'Failed to fetch upcoming sales');
    }
  }
}

export default PredictionService;
