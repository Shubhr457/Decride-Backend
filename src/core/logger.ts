import winston from 'winston';
import { env, isTest } from '../environments';

export const logger = winston.createLogger({
  level: isTest ? 'silent' : env.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [new winston.transports.Console()],
});
