import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../../../helpers/async-handler';
import { sendResponse } from '../../../helpers/api-response';
import { toDriverDocumentDto, toKycApplicationDto } from '../dtos';
import {
  addDriverDocumentMetadata,
  getDriverDocumentsForCurrentUser,
  getMyKycApplication,
  startKycApplication,
} from '../services';

export const startKyc: RequestHandler = asyncHandler(async (req, res) => {
  const application = await startKycApplication(req.user!, req.body);

  return sendResponse(
    res,
    StatusCodes.OK,
    'KYC application started successfully',
    toKycApplicationDto(application),
  );
});

export const getMyKyc: RequestHandler = asyncHandler(async (req, res) => {
  const applications = await getMyKycApplication(req.user!);

  return sendResponse(
    res,
    StatusCodes.OK,
    'KYC applications fetched successfully',
    applications.map(toKycApplicationDto),
  );
});

export const receiveKycWebhook: RequestHandler = (_req, res) => sendResponse(
  res,
  StatusCodes.ACCEPTED,
  'KYC webhook accepted',
);

export const addDriverDocument: RequestHandler = asyncHandler(async (req, res) => {
  const document = await addDriverDocumentMetadata(req.user!, req.body);

  return sendResponse(
    res,
    StatusCodes.CREATED,
    'Driver document metadata added successfully',
    toDriverDocumentDto(document),
  );
});

export const listMyDriverDocuments: RequestHandler = asyncHandler(async (req, res) => {
  const documents = await getDriverDocumentsForCurrentUser(req.user!);

  return sendResponse(
    res,
    StatusCodes.OK,
    'Driver documents fetched successfully',
    documents.map(toDriverDocumentDto),
  );
});
