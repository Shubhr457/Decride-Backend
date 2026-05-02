import crypto from "crypto";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../../../helpers/api-error";
import { DriverKycStatus } from "../../drivers/interfaces";
import { DriverProfileModel } from "../../drivers/models";
import { getDriverProfileByUserId } from "../../drivers/services";
import type { IUser, UserRole } from "../../users/interfaces";
import { UserModel } from "../../users/models";
import { KycProvider, KycStatus } from "../interfaces";
import type { DriverDocumentType } from "../interfaces";
import { DriverDocumentModel, KycApplicationModel } from "../models";

interface StartKycInput {
  role: UserRole;
  provider: KycProvider;
}

interface DriverDocumentInput {
  type: DriverDocumentType;
  fileUrl: string;
  ipfsHash?: string;
}

const createProviderApplicantId = (provider: KycProvider): string =>
  `${provider}_${crypto.randomUUID()}`;

const createDid = (walletAddress: string): string =>
  `did:decride:${walletAddress}`;

const createVcId = (): string => `vc:decride:${crypto.randomUUID()}`;

export const startKycApplication = async (
  user: IUser,
  input: StartKycInput,
) => {
  const providerApplicantId = createProviderApplicantId(input.provider);

  const application = await KycApplicationModel.findOneAndUpdate(
    { userId: user._id, role: input.role },
    {
      $set: {
        provider: input.provider,
        providerApplicantId,
        status: KycStatus.PENDING,
        rejectionReason: undefined,
        reviewedBy: undefined,
        reviewedAt: undefined,
      },
      $setOnInsert: {
        userId: user._id,
        role: input.role,
        did: createDid(user.walletAddress),
        checks: [
          { type: "identity", status: "pending", provider: input.provider },
        ],
      },
    },
    { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
  );

  if (input.role === "driver") {
    await DriverProfileModel.findOneAndUpdate(
      { userId: user._id },
      { $set: { kycStatus: DriverKycStatus.PENDING } },
    );
  }

  return application;
};

export const getMyKycApplication = async (user: IUser) => {
  const applications = await KycApplicationModel.find({
    userId: user._id,
  }).sort({ createdAt: -1 });
  return applications;
};

export const addDriverDocumentMetadata = async (
  user: IUser,
  input: DriverDocumentInput,
) => {
  const driverProfile = await getDriverProfileByUserId(user._id);

  return DriverDocumentModel.create({
    driverId: driverProfile._id,
    type: input.type,
    fileUrl: input.fileUrl,
    ipfsHash: input.ipfsHash,
  });
};

export const getDriverDocumentsForCurrentUser = async (user: IUser) => {
  const driverProfile = await getDriverProfileByUserId(user._id);
  return DriverDocumentModel.find({ driverId: driverProfile._id }).sort({
    createdAt: -1,
  });
};

export const listKycApplications = async () =>
  KycApplicationModel.find().sort({ createdAt: -1 });

export const reviewKycApplication = async (
  applicationId: string,
  reviewer: IUser,
  status: KycStatus.APPROVED | KycStatus.REJECTED,
  rejectionReason?: string,
) => {
  const application = await KycApplicationModel.findById(applicationId);

  if (!application) {
    throw new ApiError(StatusCodes.NOT_FOUND, "KYC application not found");
  }

  application.status = status;
  application.reviewedBy = reviewer._id;
  application.reviewedAt = new Date();
  application.rejectionReason =
    status === KycStatus.REJECTED ? rejectionReason : undefined;

  if (status === KycStatus.APPROVED) {
    const applicant = await UserModel.findById(application.userId);
    application.did =
      application.did ||
      createDid(applicant?.walletAddress || application.userId.toString());
    application.vcId = application.vcId || createVcId();
    application.checks = application.checks.map((check) => ({
      ...check,
      status: "approved",
    }));
  }

  await application.save();

  if (application.role === "driver") {
    await DriverProfileModel.findOneAndUpdate(
      { userId: application.userId },
      {
        $set: {
          kycStatus:
            status === KycStatus.APPROVED
              ? DriverKycStatus.APPROVED
              : DriverKycStatus.REJECTED,
        },
      },
    );
  }

  return application;
};
