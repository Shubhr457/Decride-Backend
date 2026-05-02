import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../../../helpers/async-handler";
import { sendResponse } from "../../../helpers/api-response";
import { toDriverProfileDto } from "../../drivers/dtos";
import { toKycApplicationDto } from "../../kyc/dtos";
import {
  getAllKycApplications,
  reviewKyc,
  updateDriverStatusById,
} from "../services";

export const listKyc: RequestHandler = asyncHandler(async (_req, res) => {
  const applications = await getAllKycApplications();

  return sendResponse(
    res,
    StatusCodes.OK,
    "KYC applications fetched successfully",
    applications.map(toKycApplicationDto),
  );
});

export const reviewKycController: RequestHandler = asyncHandler(
  async (req, res) => {
    const application = await reviewKyc(
      req.params.id as string,
      req.user!,
      req.body.status,
      req.body.rejectionReason,
    );

    return sendResponse(
      res,
      StatusCodes.OK,
      "KYC application reviewed successfully",
      toKycApplicationDto(application),
    );
  },
);

export const updateDriverStatusController: RequestHandler = asyncHandler(
  async (req, res) => {
    const driver = await updateDriverStatusById(
      req.params.id as string,
      req.body.status,
    );

    return sendResponse(
      res,
      StatusCodes.OK,
      "Driver status updated successfully",
      toDriverProfileDto(driver),
    );
  },
);
