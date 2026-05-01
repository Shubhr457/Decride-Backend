import mongoose from 'mongoose';
import { env } from '../environments';
import { logger } from './logger';

export const connectDatabase = async (mongoUri = env.mongoUri): Promise<typeof mongoose> => {
  mongoose.set('strictQuery', true);
  const connection = await mongoose.connect(mongoUri);
  logger.info('MongoDB connected', { database: connection.connection.name });
  return connection;
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
};

export const getDatabaseStatus = () => {
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return {
    readyState: mongoose.connection.readyState,
    status: states[mongoose.connection.readyState] || 'unknown',
    name: mongoose.connection.name || null,
    host: mongoose.connection.host || null,
  };
};
