import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ApiError } from '../helpers/api-error';

export const notFound: RequestHandler = (req, _res, next) => {
  next(new ApiError(StatusCodes.NOT_FOUND, `Route ${req.method} ${req.originalUrl} not found`));
};
