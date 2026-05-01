import http from 'http';
import { app } from './app';
import { connectDatabase, disconnectDatabase } from './core/database';
import { logger } from './core/logger';
import { env } from './environments';

const server = http.createServer(app);

const startServer = async () => {
  try {
    await connectDatabase();
    server.listen(env.port, () => {
      logger.info(`Decride backend listening on port ${env.port}`);
    });
  } catch (error) {
    logger.error('Failed to start Decride backend', { error });
    process.exit(1);
  }
};

const shutdown = async (signal: string) => {
  logger.info(`${signal} received. Shutting down server.`);
  server.close(async () => {
    await disconnectDatabase();
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

void startServer();
