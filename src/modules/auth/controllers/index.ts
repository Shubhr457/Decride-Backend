import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../../../helpers/async-handler';
import { sendResponse } from '../../../helpers/api-response';
import { toAuthResponseDto, toNonceResponseDto } from '../dtos';
import { requestWalletNonce, verifyWalletSignature } from '../services';
import { toUserDto } from '../../users/dtos';

export const requestNonce: RequestHandler = asyncHandler(async (req, res) => {
  const { walletAddress } = req.body;
  const nonceResult = await requestWalletNonce(walletAddress);

  return sendResponse(
    res,
    StatusCodes.OK,
    'Wallet nonce generated successfully',
    toNonceResponseDto(nonceResult.nonce, nonceResult.message),
  );
});

export const verifyWallet: RequestHandler = asyncHandler(async (req, res) => {
  const { walletAddress, signature } = req.body;
  const { user, accessToken } = await verifyWalletSignature(walletAddress, signature);

  return sendResponse(
    res,
    StatusCodes.OK,
    'Wallet authenticated successfully',
    toAuthResponseDto(user, accessToken),
  );
});

export const getMe: RequestHandler = asyncHandler(async (req, res) => sendResponse(
  res,
  StatusCodes.OK,
  'Authenticated user fetched successfully',
  toUserDto(req.user!),
));

export const logout: RequestHandler = (_req, res) => sendResponse(
  res,
  StatusCodes.OK,
  'Logged out successfully',
);
