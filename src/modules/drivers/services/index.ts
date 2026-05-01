import type { Types } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { ApiError } from '../../../helpers/api-error';
import type { IUser } from '../../users/interfaces';
import { UserRole } from '../../users/interfaces';
import { DriverProfileModel, VehicleModel } from '../models';
import type { VehicleType } from '../interfaces';

interface UpsertDriverProfileInput {
  fullName: string;
  avatarUrl?: string;
}

interface CreateVehicleInput {
  make: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  vehicleType: VehicleType;
}

const ensureDriverRole = (user: IUser) => {
  if (![UserRole.DRIVER, UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role)) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Only driver accounts can manage driver profiles');
  }
};

export const upsertDriverProfile = async (user: IUser, input: UpsertDriverProfileInput) => {
  ensureDriverRole(user);

  const profile = await DriverProfileModel.findOneAndUpdate(
    { userId: user._id },
    { $set: input },
    { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true },
  );

  user.profileCompleted = true;
  await user.save();

  return profile;
};

export const getDriverProfileByUserId = async (userId: Types.ObjectId) => {
  const profile = await DriverProfileModel.findOne({ userId });

  if (!profile) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Driver profile not found');
  }

  return profile;
};

export const setDriverAvailability = async (user: IUser, isAvailable: boolean) => {
  ensureDriverRole(user);
  const profile = await getDriverProfileByUserId(user._id);

  profile.isAvailable = isAvailable;
  await profile.save();

  return profile;
};

export const updateDriverLocation = async (user: IUser, latitude: number, longitude: number) => {
  ensureDriverRole(user);
  const profile = await getDriverProfileByUserId(user._id);

  profile.currentLocation = {
    type: 'Point',
    coordinates: [longitude, latitude],
  };
  await profile.save();

  return profile;
};

export const createVehicle = async (user: IUser, input: CreateVehicleInput) => {
  ensureDriverRole(user);
  const profile = await getDriverProfileByUserId(user._id);
  const plateNumber = input.plateNumber.toUpperCase().trim();

  const existingVehicle = await VehicleModel.findOne({
    driverId: profile._id,
    plateNumber,
  });

  if (existingVehicle) {
    throw new ApiError(StatusCodes.CONFLICT, 'Vehicle with this plate number already exists');
  }

  return VehicleModel.create({
    driverId: profile._id,
    make: input.make,
    model: input.model,
    year: input.year,
    color: input.color,
    plateNumber,
    vehicleType: input.vehicleType,
  });
};

export const getVehiclesForDriver = async (user: IUser) => {
  ensureDriverRole(user);
  const profile = await getDriverProfileByUserId(user._id);

  return VehicleModel.find({ driverId: profile._id }).sort({ createdAt: -1 });
};
