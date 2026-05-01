import type { IRiderProfile } from '../interfaces';

export const toRiderProfileDto = (profile: IRiderProfile) => ({
  id: profile._id.toString(),
  userId: profile.userId.toString(),
  fullName: profile.fullName,
  avatarUrl: profile.avatarUrl || null,
  defaultPaymentMethod: profile.defaultPaymentMethod || null,
  ratingAverage: profile.ratingAverage,
  ratingCount: profile.ratingCount,
  createdAt: profile.createdAt,
  updatedAt: profile.updatedAt,
});
