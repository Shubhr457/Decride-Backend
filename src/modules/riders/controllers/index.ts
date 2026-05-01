import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../../../helpers/async-handler';
import { sendResponse } from '../../../helpers/api-response';
import { toRiderProfileDto } from '../dtos';
import { getRiderProfileByUserId, upsertRiderProfile } from '../services';

export const createOrUpdateRiderProfile: RequestHandler = asyncHandler(async (req, res) => {
  const profile = await upsertRiderProfile(req.user!, req.body);

  return sendResponse(
    res,
    StatusCodes.OK,
    'Rider profile saved successfully',
    toRiderProfileDto(profile),
  );
});

export const getMyRiderProfile: RequestHandler = asyncHandler(async (req, res) => {
  const profile = await getRiderProfileByUserId(req.user!._id);

  return sendResponse(
    res,
    StatusCodes.OK,
    'Rider profile fetched successfully',
    toRiderProfileDto(profile),
  );
});
