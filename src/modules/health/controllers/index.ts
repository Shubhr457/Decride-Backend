import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { sendResponse } from '../../../helpers/api-response';
import { getHealthDatabaseStatus, getHealthStatus } from '../services';

export const healthCheck: RequestHandler = (_req, res) => {
  sendResponse(res, StatusCodes.OK, 'Backend service is healthy', getHealthStatus());
};

export const databaseHealthCheck: RequestHandler = (_req, res) => {
  const status = getHealthDatabaseStatus();
  const statusCode = status.status === 'connected' ? StatusCodes.OK : StatusCodes.SERVICE_UNAVAILABLE;
  sendResponse(res, statusCode, 'Database health status fetched', status);
};
