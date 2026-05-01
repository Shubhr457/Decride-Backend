import type { IUser } from '../interfaces';

export const toUserDto = (user: IUser) => ({
  id: user._id.toString(),
  walletAddress: user.walletAddress,
  role: user.role,
  status: user.status,
  email: user.email || null,
  phone: user.phone || null,
  profileCompleted: user.profileCompleted,
  lastLoginAt: user.lastLoginAt || null,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
