import type { ErrorRequestHandler } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { isProduction } from '../environments';
import { ApiError } from '../helpers/api-error';
import { logger } from '../core/logger';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const statusCode = error instanceof ApiError
    ? error.statusCode
    : StatusCodes.INTERNAL_SERVER_ERROR;

  const message = error instanceof ApiError
    ? error.message
    : ReasonPhrases.INTERNAL_SERVER_ERROR;

  logger.error(message, {
    statusCode,
    stack: error.stack,
    details: error instanceof ApiError ? error.details : undefined,
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(!isProduction && {
      error: {
        details: error instanceof ApiError ? error.details : undefined,
        stack: error.stack,
      },
    }),
  });
};
