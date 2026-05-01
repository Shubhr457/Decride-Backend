import type { IDriverProfile, IVehicle } from '../interfaces';

export const toDriverProfileDto = (profile: IDriverProfile) => ({
  id: profile._id.toString(),
  userId: profile.userId.toString(),
  fullName: profile.fullName,
  avatarUrl: profile.avatarUrl || null,
  status: profile.status,
  isAvailable: profile.isAvailable,
  currentLocation: profile.currentLocation || null,
  ratingAverage: profile.ratingAverage,
  ratingCount: profile.ratingCount,
  stakingStatus: profile.stakingStatus,
  kycStatus: profile.kycStatus,
  createdAt: profile.createdAt,
  updatedAt: profile.updatedAt,
});

export const toVehicleDto = (vehicle: IVehicle) => ({
  id: vehicle._id.toString(),
  driverId: vehicle.driverId.toString(),
  make: vehicle.make,
  model: vehicle.model,
  year: vehicle.year,
  color: vehicle.color,
  plateNumber: vehicle.plateNumber,
  vehicleType: vehicle.vehicleType,
  status: vehicle.status,
  createdAt: vehicle.createdAt,
  updatedAt: vehicle.updatedAt,
});
