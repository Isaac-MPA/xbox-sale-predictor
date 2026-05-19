import prisma from '../utils/prisma';
import PredictionService from '../services/predictionService';
import logger from '../utils/logger';

/**
 * Prediction Calculation Job - Recalculates predictions for all games
 * Runs daily at 2 AM
 */
export const predictionCalculationJob = async (): Promise<void> => {
  const startTime = Date.now();

  try {
    // Create sync log entry
    const syncLog = await prisma.syncLog.create({
      data: {
        syncType: 'PREDICTION_CALCULATION',
        status: 'IN_PROGRESS',
      },
    });

    // Get all games with sufficient price history
    const games = await prisma.game.findMany({
      include: {
        priceHistory: {
          orderBy: { date: 'asc' },
        },
      },
    });

    logger.info(`Processing ${games.length} games for prediction calculation`);

    let processedCount = 0;
    let failedCount = 0;

    // Calculate prediction for each game
    for (const game of games) {
      try {
        if (game.priceHistory.length >= 3) {
          await PredictionService.calculatePrediction(game.id);
          processedCount++;
        }
      } catch (error) {
        logger.error(`Failed to calculate prediction for ${game.title}:`, error);
        failedCount++;
      }
    }

    // Update sync log
    const duration = Date.now() - startTime;
    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: 'SUCCESS',
        itemsProcessed: processedCount,
        itemsFailed: failedCount,
        completedAt: new Date(),
        duration,
      },
    });

    logger.info(`Prediction calculation job completed: ${processedCount} processed, ${failedCount} failed`);
  } catch (error) {
    logger.error('Prediction calculation job error:', error);
  }
};
