import { ReasonPhrases, StatusCodes } from "http-status-codes";

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
    message: string = ReasonPhrases.INTERNAL_SERVER_ERROR,
    details?: unknown,
    isOperational = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}
