import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../../../helpers/async-handler';
import { sendResponse } from '../../../helpers/api-response';
import { toDriverProfileDto, toVehicleDto } from '../dtos';
import {
  createVehicle,
  getDriverProfileByUserId,
  getVehiclesForDriver,
  setDriverAvailability,
  updateDriverLocation,
  upsertDriverProfile,
} from '../services';

export const createOrUpdateDriverProfile: RequestHandler = asyncHandler(async (req, res) => {
  const profile = await upsertDriverProfile(req.user!, req.body);

  return sendResponse(
    res,
    StatusCodes.OK,
    'Driver profile saved successfully',
    toDriverProfileDto(profile),
  );
});

export const getMyDriverProfile: RequestHandler = asyncHandler(async (req, res) => {
  const profile = await getDriverProfileByUserId(req.user!._id);

  return sendResponse(
    res,
    StatusCodes.OK,
    'Driver profile fetched successfully',
    toDriverProfileDto(profile),
  );
});

export const updateAvailability: RequestHandler = asyncHandler(async (req, res) => {
  const profile = await setDriverAvailability(req.user!, req.body.isAvailable);

  return sendResponse(
    res,
    StatusCodes.OK,
    'Driver availability updated successfully',
    toDriverProfileDto(profile),
  );
});

export const updateLocation: RequestHandler = asyncHandler(async (req, res) => {
  const profile = await updateDriverLocation(req.user!, req.body.latitude, req.body.longitude);

  return sendResponse(
    res,
    StatusCodes.OK,
    'Driver location updated successfully',
    toDriverProfileDto(profile),
  );
});

export const addVehicle: RequestHandler = asyncHandler(async (req, res) => {
  const vehicle = await createVehicle(req.user!, req.body);

  return sendResponse(
    res,
    StatusCodes.CREATED,
    'Vehicle added successfully',
    toVehicleDto(vehicle),
  );
});

export const listVehicles: RequestHandler = asyncHandler(async (req, res) => {
  const vehicles = await getVehiclesForDriver(req.user!);

  return sendResponse(
    res,
    StatusCodes.OK,
    'Driver vehicles fetched successfully',
    vehicles.map(toVehicleDto),
  );
});
