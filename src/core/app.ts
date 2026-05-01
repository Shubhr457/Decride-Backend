import compression from 'compression';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import { env, isTest } from '../environments';
import { errorHandler } from '../middlewares/error-handler';
import { notFound } from '../middlewares/not-found';
import apiRoutes from '../modules';
import { logger } from './logger';

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin === '*' ? true : env.corsOrigin, credentials: true }));
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  app.use(rateLimit({
    windowMs: env.rateLimitWindowMs,
    limit: env.rateLimitMaxRequests,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  }));

  if (!isTest) {
    app.use(morgan('combined', {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    }));
  }

  app.use('/api/v1', apiRoutes);
  app.use(notFound);
  app.use(errorHandler);

  return app;
};
