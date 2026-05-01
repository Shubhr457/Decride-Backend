import type { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

export type TypedRequest<TBody = unknown, TQuery = unknown, TParams = unknown> = Request<TParams, unknown, TBody, TQuery>;
