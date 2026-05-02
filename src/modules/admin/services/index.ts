import { StatusCodes } from 'http-status-codes';
import { ApiError } from '../../../helpers/api-error';
import { DriverProfileModel } from '../../drivers/models';
import type { DriverStatus } from '../../drivers/interfaces';
import type { IUser } from '../../users/interfaces';
import { KycStatus } from '../../kyc/interfaces';
import { listKycApplications, reviewKycApplication } from '../../kyc/services';

export const getAllKycApplications = async () => listKycApplications();

export const reviewKyc = async (
  applicationId: string,
  reviewer: IUser,
  status: KycStatus.APPROVED | KycStatus.REJECTED,
  rejectionReason?: string,
) => reviewKycApplication(applicationId, reviewer, status, rejectionReason);

export const updateDriverStatusById = async (driverId: string, status: DriverStatus) => {
  const driver = await DriverProfileModel.findByIdAndUpdate(
    driverId,
    { $set: { status } },
    { returnDocument: 'after' },
  );

  if (!driver) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Driver profile not found');
  }

  return driver;
};
