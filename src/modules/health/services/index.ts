import { getDatabaseStatus } from '../../../core/database';
import { env } from '../../../environments';

export const getHealthStatus = () => ({
  service: 'decride-backend',
  status: 'ok',
  environment: env.nodeEnv,
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
});

export const getHealthDatabaseStatus = () => ({
  service: 'mongodb',
  ...getDatabaseStatus(),
  timestamp: new Date().toISOString(),
});
