import 'dotenv/config';
import 'express-async-errors';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import logger from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { rateLimitMiddleware } from './middleware/rateLimit';
import gameRoutes from './routes/gameRoutes';
import predictionRoutes from './routes/predictionRoutes';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import { initializeScheduledJobs } from './jobs/scheduler';

const app: Express = express();
const PORT = process.env.PORT || 3001;

// ============ MIDDLEWARE ============

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting
app.use(rateLimitMiddleware);

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// ============ HEALTH CHECK ============

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ============ API ROUTES ============

app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// ============ 404 HANDLER ============

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ============ ERROR HANDLER ============

app.use(errorHandler);

// ============ START SERVER ============

const startServer = async (): Promise<void> => {
  try {
    // Initialize scheduled jobs
    initializeScheduledJobs();
    logger.info('Scheduled jobs initialized');

    app.listen(PORT, () => {
      logger.info(`🎮 Xbox Sale Predictor API running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
