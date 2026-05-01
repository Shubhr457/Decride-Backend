import type { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { ApiResponse } from '../interfaces/api-response.interface';

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
): Response<ApiResponse<T>> => res.status(statusCode).json({
  success: statusCode < StatusCodes.BAD_REQUEST,
  message,
  ...(data !== undefined ? { data } : {}),
});
