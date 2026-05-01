import type { Request } from "express";
import type { IUser } from "../modules/users/interfaces";

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      user?: IUser;
    }
  }
}

export type TypedRequest<
  TBody = unknown,
  TQuery = unknown,
  TParams = unknown,
> = Request<TParams, unknown, TBody, TQuery>;
