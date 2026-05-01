import type { IUser } from '../../users/interfaces';
import { toUserDto } from '../../users/dtos';

export const toAuthResponseDto = (user: IUser, accessToken: string) => ({
  accessToken,
  tokenType: 'Bearer',
  user: toUserDto(user),
});

export const toNonceResponseDto = (nonce: string, message: string) => ({
  nonce,
  message,
});
