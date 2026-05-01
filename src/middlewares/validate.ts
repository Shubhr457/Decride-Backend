import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { ZodSchema } from 'zod';
import { ApiError } from '../helpers/api-error';

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export const validate = (schemas: ValidationSchemas) => (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    if (schemas.body) req.body = schemas.body.parse(req.body);
    if (schemas.query) req.query = schemas.query.parse(req.query) as typeof req.query;
    if (schemas.params) req.params = schemas.params.parse(req.params) as typeof req.params;
    next();
  } catch (error) {
    next(new ApiError(StatusCodes.BAD_REQUEST, 'Validation failed', error));
  }
};
