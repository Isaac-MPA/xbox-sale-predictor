import cron from 'node-cron';
import logger from '../utils/logger';
import { priceUpdateJob } from './priceUpdateJob';
import { predictionCalculationJob } from './predictionCalculationJob';

/**
 * Initialize all scheduled jobs
 */
export const initializeScheduledJobs = (): void => {
  logger.info('Initializing scheduled jobs...');

  // Update prices every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    logger.info('Running price update job...');
    try {
      await priceUpdateJob();
    } catch (error) {
      logger.error('Price update job failed:', error);
    }
  });

  // Recalculate predictions daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    logger.info('Running prediction calculation job...');
    try {
      await predictionCalculationJob();
    } catch (error) {
      logger.error('Prediction calculation job failed:', error);
    }
  });

  logger.info('Scheduled jobs initialized successfully');
};
