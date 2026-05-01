import type { Types } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { ApiError } from '../../../helpers/api-error';
import type { IUser } from '../../users/interfaces';
import { UserRole } from '../../users/interfaces';
import { RiderProfileModel } from '../models';

interface UpsertRiderProfileInput {
  fullName: string;
  avatarUrl?: string;
  defaultPaymentMethod?: string;
}

const ensureRiderRole = (user: IUser) => {
  if (![UserRole.RIDER, UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role)) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Only rider accounts can manage rider profiles');
  }
};

export const upsertRiderProfile = async (user: IUser, input: UpsertRiderProfileInput) => {
  ensureRiderRole(user);

  const profile = await RiderProfileModel.findOneAndUpdate(
    { userId: user._id },
    { $set: input },
    { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true },
  );

  user.profileCompleted = true;
  await user.save();

  return profile;
};

export const getRiderProfileByUserId = async (userId: Types.ObjectId) => {
  const profile = await RiderProfileModel.findOne({ userId });

  if (!profile) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Rider profile not found');
  }

  return profile;
};
