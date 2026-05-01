import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../../../helpers/async-handler';
import { sendResponse } from '../../../helpers/api-response';
import { toUserDto } from '../dtos';
import { updateCurrentUser } from '../services';

export const updateMe: RequestHandler = asyncHandler(async (req, res) => {
  const user = await updateCurrentUser(req.user!, req.body);

  return sendResponse(
    res,
    StatusCodes.OK,
    'User profile updated successfully',
    toUserDto(user),
  );
});
