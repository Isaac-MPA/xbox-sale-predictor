import { PrismaClient } from '@prisma/client';
import logger from './logger';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // In development, use a global instance to prevent connection issues
  const globalAny = global as any;
  if (!globalAny.prisma) {
    globalAny.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = globalAny.prisma;
}

// Handle connection
prisma.$connect()
  .then(() => logger.info('Database connected'))
  .catch((error) => {
    logger.error('Database connection failed:', error);
    process.exit(1);
  });

// Handle disconnection
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  logger.info('Database disconnected');
});

export default prisma;
