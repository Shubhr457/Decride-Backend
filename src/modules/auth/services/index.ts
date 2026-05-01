import crypto from "crypto";
import { getAddress, isAddress, verifyMessage } from "ethers";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { env } from "../../../environments";
import { ApiError } from "../../../helpers/api-error";
import { UserStatus } from "../../users/interfaces";
import type { IUser } from "../../users/interfaces";
import { UserModel } from "../../users/models";

export interface AuthTokenPayload extends JwtPayload {
  sub: string;
  walletAddress: string;
  role: string;
}

const normalizeWalletAddress = (walletAddress: string): string => {
  if (!isAddress(walletAddress)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid wallet address");
  }

  return getAddress(walletAddress).toLowerCase();
};

const createNonce = (): string => crypto.randomBytes(32).toString("hex");

export const buildWalletLoginMessage = (nonce: string): string =>
  `${env.walletLoginMessagePrefix}\n\nNonce: ${nonce}`;

export const issueAccessToken = (user: IUser): string => {
  const payload: AuthTokenPayload = {
    sub: user._id.toString(),
    walletAddress: user.walletAddress,
    role: user.role,
  };

  const options: SignOptions = {
    expiresIn: env.jwtAccessExpiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, env.jwtAccessSecret, options);
};

export const verifyAccessToken = (token: string): AuthTokenPayload => {
  try {
    return jwt.verify(token, env.jwtAccessSecret) as AuthTokenPayload;
  } catch (_error) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      "Invalid or expired access token",
    );
  }
};

export const requestWalletNonce = async (walletAddress: string) => {
  const normalizedWalletAddress = normalizeWalletAddress(walletAddress);
  const nonce = createNonce();

  const user = await UserModel.findOneAndUpdate(
    { walletAddress: normalizedWalletAddress },
    {
      $set: { nonce },
      $setOnInsert: { walletAddress: normalizedWalletAddress },
    },
    { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
  );

  if (user.status === UserStatus.SUSPENDED) {
    throw new ApiError(StatusCodes.FORBIDDEN, "User account is suspended");
  }

  return {
    nonce: user.nonce,
    message: buildWalletLoginMessage(user.nonce),
  };
};

export const verifyWalletSignature = async (
  walletAddress: string,
  signature: string,
) => {
  const normalizedWalletAddress = normalizeWalletAddress(walletAddress);
  const user = await UserModel.findOne({
    walletAddress: normalizedWalletAddress,
  });

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Wallet nonce not requested");
  }

  if (user.status === UserStatus.SUSPENDED) {
    throw new ApiError(StatusCodes.FORBIDDEN, "User account is suspended");
  }

  const message = buildWalletLoginMessage(user.nonce);
  let recoveredAddress: string;

  try {
    recoveredAddress = getAddress(
      verifyMessage(message, signature),
    ).toLowerCase();
  } catch (_error) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid wallet signature");
  }

  if (recoveredAddress !== normalizedWalletAddress) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid wallet signature");
  }

  user.nonce = createNonce();
  user.lastLoginAt = new Date();
  await user.save();

  const accessToken = issueAccessToken(user);
  return { user, accessToken };
};
