import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../../../helpers/async-handler';
import { sendResponse } from '../../../helpers/api-response';
import { toFareEstimateDto, toRideDto } from '../dtos';
import {
  acceptRide,
  cancelRide,
  completeRide,
  estimateRideFare,
  getMyRides,
  getRideForUser,
  markDriverArrived,
  rejectRide,
  requestRide,
  startRide,
} from '../services';

export const estimateFareController: RequestHandler = asyncHandler(async (req, res) => {
  const estimate = estimateRideFare(req.body);

  return sendResponse(
    res,
    StatusCodes.OK,
    'Ride fare estimated successfully',
    toFareEstimateDto(
      estimate.estimatedDistanceKm,
      estimate.estimatedDurationMin,
      estimate.fareBreakdown,
    ),
  );
});

export const requestRideController: RequestHandler = asyncHandler(async (req, res) => {
  const ride = await requestRide(req.user!, req.body);

  return sendResponse(
    res,
    StatusCodes.CREATED,
    'Ride requested successfully',
    toRideDto(ride),
  );
});

export const getRideController: RequestHandler = asyncHandler(async (req, res) => {
  const ride = await getRideForUser(req.params.id as string, req.user!);

  return sendResponse(
    res,
    StatusCodes.OK,
    'Ride fetched successfully',
    toRideDto(ride),
  );
});

export const getMyRidesController: RequestHandler = asyncHandler(async (req, res) => {
  const rides = await getMyRides(req.user!);

  return sendResponse(
    res,
    StatusCodes.OK,
    'Rides fetched successfully',
    rides.map(toRideDto),
  );
});

export const acceptRideController: RequestHandler = asyncHandler(async (req, res) => {
  const ride = await acceptRide(req.params.id as string, req.user!);

  return sendResponse(res, StatusCodes.OK, 'Ride accepted successfully', toRideDto(ride));
});

export const rejectRideController: RequestHandler = asyncHandler(async (req, res) => {
  const ride = await rejectRide(req.params.id as string, req.user!);

  return sendResponse(res, StatusCodes.OK, 'Ride rejected successfully', toRideDto(ride));
});

export const arrivedRideController: RequestHandler = asyncHandler(async (req, res) => {
  const ride = await markDriverArrived(req.params.id as string, req.user!);

  return sendResponse(res, StatusCodes.OK, 'Driver arrival marked successfully', toRideDto(ride));
});

export const startRideController: RequestHandler = asyncHandler(async (req, res) => {
  const ride = await startRide(req.params.id as string, req.user!);

  return sendResponse(res, StatusCodes.OK, 'Ride started successfully', toRideDto(ride));
});

export const completeRideController: RequestHandler = asyncHandler(async (req, res) => {
  const ride = await completeRide(req.params.id as string, req.user!);

  return sendResponse(res, StatusCodes.OK, 'Ride completed successfully', toRideDto(ride));
});

export const cancelRideController: RequestHandler = asyncHandler(async (req, res) => {
  const ride = await cancelRide(req.params.id as string, req.user!);

  return sendResponse(res, StatusCodes.OK, 'Ride cancelled successfully', toRideDto(ride));
});
