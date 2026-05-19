import prisma from '../utils/prisma';
import logger from '../utils/logger';

/**
 * Price Update Job - Fetches latest prices from Xbox Store
 * Runs every 6 hours
 */
export const priceUpdateJob = async (): Promise<void> => {
  const startTime = Date.now();

  try {
    // Create sync log entry
    const syncLog = await prisma.syncLog.create({
      data: {
        syncType: 'PRICE_UPDATE',
        status: 'IN_PROGRESS',
      },
    });

    // Get all games
    const games = await prisma.game.findMany();
    logger.info(`Processing ${games.length} games for price update`);

    let processedCount = 0;
    let failedCount = 0;

    // For each game, update price
    for (const game of games) {
      try {
        // TODO: Call Xbox API to get current price
        // const price = await fetchXboxPrice(game.xboxGameId);
        // await priceService.recordPrice({ gameId: game.id, price });

        processedCount++;
      } catch (error) {
        logger.error(`Failed to update price for ${game.title}:`, error);
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

    logger.info(`Price update job completed: ${processedCount} processed, ${failedCount} failed`);
  } catch (error) {
    logger.error('Price update job error:', error);
  }
};
