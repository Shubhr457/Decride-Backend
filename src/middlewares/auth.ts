import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ApiError } from '../helpers/api-error';
import { asyncHandler } from '../helpers/async-handler';
import { verifyAccessToken } from '../modules/auth/services';
import { UserRole, UserStatus } from '../modules/users/interfaces';
import { UserModel } from '../modules/users/models';

const getBearerToken = (authorization?: string): string => {
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authorization bearer token is required');
  }

  return authorization.replace('Bearer ', '').trim();
};

export const authenticate: RequestHandler = asyncHandler(async (req, _res, next) => {
  const token = getBearerToken(req.headers.authorization);
  const payload = verifyAccessToken(token);
  const user = await UserModel.findById(payload.sub);

  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authenticated user no longer exists');
  }

  if (user.status !== UserStatus.ACTIVE) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'User account is not active');
  }

  req.user = user;
  next();
});

export const authorizeRoles = (...roles: UserRole[]): RequestHandler => (req, _res, next) => {
  if (!req.user) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required'));
    return;
  }

  if (!roles.includes(req.user.role)) {
    next(new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to access this resource'));
    return;
  }

  next();
};
