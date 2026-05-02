import type { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../../../helpers/api-error";
import {
  DriverKycStatus,
  DriverStatus,
  VehicleType,
} from "../../drivers/interfaces";
import { DriverProfileModel, VehicleModel } from "../../drivers/models";
import { getDriverProfileByUserId } from "../../drivers/services";
import type { IUser } from "../../users/interfaces";
import { UserRole } from "../../users/interfaces";
import { RideModel } from "../models";
import {
  FareBreakdown,
  RideCancellationReason,
  RideStatus,
} from "../interfaces";
import type { IRide } from "../interfaces";

interface LocationInput {
  latitude: number;
  longitude: number;
  address?: string;
}

interface EstimateInput {
  pickup: LocationInput;
  dropoff: LocationInput;
  vehicleType?: VehicleType;
}

interface RideRequestInput extends EstimateInput {
  paymentToken: string;
  metadataHash?: string;
}

const ACTIVE_RIDE_STATUSES = [
  RideStatus.MATCHED,
  RideStatus.ACCEPTED,
  RideStatus.ARRIVED,
  RideStatus.ACTIVE,
];

const DEFAULT_MATCH_RADIUS_KM = 8;
const AVERAGE_CITY_SPEED_KMPH = 30;
const BASE_FARE = 2;
const PER_KM_RATE = 1.2;
const PER_MIN_RATE = 0.25;
const PLATFORM_FEE_RATE = 0.1;

const roundMoney = (value: number): number => Math.round(value * 100) / 100;

const toGeoPoint = (location: LocationInput) => ({
  type: "Point" as const,
  coordinates: [location.longitude, location.latitude] as [number, number],
});

const haversineDistanceKm = (
  origin: LocationInput,
  destination: LocationInput,
): number => {
  const earthRadiusKm = 6371;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latDelta = toRadians(destination.latitude - origin.latitude);
  const lonDelta = toRadians(destination.longitude - origin.longitude);
  const originLat = toRadians(origin.latitude);
  const destinationLat = toRadians(destination.latitude);

  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(originLat) *
      Math.cos(destinationLat) *
      Math.sin(lonDelta / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
};

const vehicleMultiplier = (vehicleType?: VehicleType): number => {
  switch (vehicleType) {
    case VehicleType.PREMIUM:
      return 1.4;
    case VehicleType.XL:
      return 1.6;
    case VehicleType.ELECTRIC:
      return 1.2;
    default:
      return 1;
  }
};

const ensureRiderCanRequest = (user: IUser) => {
  if (
    ![UserRole.RIDER, UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role)
  ) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "Only rider accounts can request rides",
    );
  }
};

const ensureDriverParticipant = async (user: IUser, ride: IRide) => {
  if (user.role !== UserRole.DRIVER) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "Only the assigned driver can perform this ride action",
    );
  }

  const driverProfile = await getDriverProfileByUserId(user._id);

  if (!ride.driverId || !ride.driverId.equals(driverProfile._id)) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "Driver is not assigned to this ride",
    );
  }

  return driverProfile;
};

const ensureRideAccess = async (ride: IRide, user: IUser) => {
  if ([UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role)) return;

  if (ride.riderId.equals(user._id)) return;

  if (user.role === UserRole.DRIVER && ride.driverId) {
    const driverProfile = await getDriverProfileByUserId(user._id);
    if (ride.driverId.equals(driverProfile._id)) return;
  }

  throw new ApiError(
    StatusCodes.FORBIDDEN,
    "You do not have access to this ride",
  );
};

const getRideOrThrow = async (rideId: string) => {
  const ride = await RideModel.findById(rideId);

  if (!ride) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Ride not found");
  }

  return ride;
};

const setDriverAvailabilityById = async (
  driverId: Types.ObjectId,
  isAvailable: boolean,
) => {
  await DriverProfileModel.findByIdAndUpdate(driverId, {
    $set: { isAvailable },
  });
};

export const estimateRideFare = (input: EstimateInput) => {
  const distanceKm = Math.max(
    haversineDistanceKm(input.pickup, input.dropoff),
    0.5,
  );
  const durationMin = Math.max((distanceKm / AVERAGE_CITY_SPEED_KMPH) * 60, 5);
  const multiplier = vehicleMultiplier(input.vehicleType);
  const baseFare = roundMoney(BASE_FARE * multiplier);
  const distanceFare = roundMoney(distanceKm * PER_KM_RATE * multiplier);
  const durationFare = roundMoney(durationMin * PER_MIN_RATE * multiplier);
  const subtotal = baseFare + distanceFare + durationFare;
  const platformFee = roundMoney(subtotal * PLATFORM_FEE_RATE);
  const totalFare = roundMoney(subtotal + platformFee);

  const fareBreakdown: FareBreakdown = {
    currency: "USD",
    baseFare,
    distanceFare,
    durationFare,
    platformFee,
    totalFare,
  };

  return {
    estimatedDistanceKm: Math.round(distanceKm * 100) / 100,
    estimatedDurationMin: Math.round(durationMin),
    fareBreakdown,
  };
};

export const findEligibleDriver = async (
  pickup: LocationInput,
  vehicleType?: VehicleType,
) => {
  const busyDriverIds = await RideModel.distinct("driverId", {
    status: { $in: ACTIVE_RIDE_STATUSES },
    driverId: { $exists: true, $ne: null },
  });

  let vehicleDriverIds: Types.ObjectId[] | undefined;
  if (vehicleType) {
    const vehicles = await VehicleModel.find({ vehicleType }).select(
      "driverId",
    );
    vehicleDriverIds = vehicles.map((vehicle) => vehicle.driverId);

    if (vehicleDriverIds.length === 0) return null;
  }

  const query: Record<string, unknown> = {
    status: DriverStatus.APPROVED,
    kycStatus: DriverKycStatus.APPROVED,
    isAvailable: true,
    currentLocation: { $exists: true },
    _id: { $nin: busyDriverIds },
  };

  if (vehicleDriverIds) {
    query._id = { $in: vehicleDriverIds, $nin: busyDriverIds };
  }

  const drivers = await DriverProfileModel.find(query).limit(50);
  const pickupPoint = pickup;

  return (
    drivers
      .map((driver) => {
        const [longitude, latitude] = driver.currentLocation!.coordinates;
        const distanceKm = haversineDistanceKm(pickupPoint, {
          latitude,
          longitude,
        });
        return { driver, distanceKm };
      })
      .filter(({ distanceKm }) => distanceKm <= DEFAULT_MATCH_RADIUS_KM)
      .sort((a, b) => a.distanceKm - b.distanceKm)[0]?.driver || null
  );
};

export const requestRide = async (user: IUser, input: RideRequestInput) => {
  ensureRiderCanRequest(user);

  const estimate = estimateRideFare(input);
  const matchedDriver = await findEligibleDriver(
    input.pickup,
    input.vehicleType,
  );
  const now = new Date();

  const ride = await RideModel.create({
    riderId: user._id,
    driverId: matchedDriver?._id,
    status: matchedDriver ? RideStatus.MATCHED : RideStatus.EXPIRED,
    pickupLocation: toGeoPoint(input.pickup),
    dropoffLocation: toGeoPoint(input.dropoff),
    pickupAddress: input.pickup.address,
    dropoffAddress: input.dropoff.address,
    vehicleType: input.vehicleType,
    estimatedDistanceKm: estimate.estimatedDistanceKm,
    estimatedDurationMin: estimate.estimatedDurationMin,
    estimatedFare: estimate.fareBreakdown.totalFare,
    fareBreakdown: estimate.fareBreakdown,
    paymentToken: input.paymentToken,
    metadataHash: input.metadataHash,
    requestedAt: now,
    matchedAt: matchedDriver ? now : undefined,
    expiredAt: matchedDriver ? undefined : now,
    cancellationReason: matchedDriver
      ? undefined
      : RideCancellationReason.NO_DRIVER_AVAILABLE,
  });

  if (matchedDriver) {
    await setDriverAvailabilityById(matchedDriver._id, false);
  }

  return ride;
};

export const getRideForUser = async (rideId: string, user: IUser) => {
  const ride = await getRideOrThrow(rideId);
  await ensureRideAccess(ride, user);
  return ride;
};

export const getMyRides = async (user: IUser) => {
  if ([UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role)) {
    return RideModel.find().sort({ createdAt: -1 });
  }

  if (user.role === UserRole.DRIVER) {
    const driverProfile = await getDriverProfileByUserId(user._id);
    return RideModel.find({ driverId: driverProfile._id }).sort({
      createdAt: -1,
    });
  }

  return RideModel.find({ riderId: user._id }).sort({ createdAt: -1 });
};

export const acceptRide = async (rideId: string, user: IUser) => {
  const ride = await getRideOrThrow(rideId);
  await ensureDriverParticipant(user, ride);

  if (ride.status !== RideStatus.MATCHED) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      "Ride is not available for acceptance",
    );
  }

  ride.status = RideStatus.ACCEPTED;
  ride.acceptedAt = new Date();
  await ride.save();

  return ride;
};

export const rejectRide = async (rideId: string, user: IUser) => {
  const ride = await getRideOrThrow(rideId);
  const driverProfile = await ensureDriverParticipant(user, ride);

  if (![RideStatus.MATCHED, RideStatus.ACCEPTED].includes(ride.status)) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      "Ride cannot be rejected in its current status",
    );
  }

  ride.status = RideStatus.EXPIRED;
  ride.expiredAt = new Date();
  ride.cancellationReason = RideCancellationReason.NO_DRIVER_AVAILABLE;
  await ride.save();
  await setDriverAvailabilityById(driverProfile._id, true);

  return ride;
};

export const markDriverArrived = async (rideId: string, user: IUser) => {
  const ride = await getRideOrThrow(rideId);
  await ensureDriverParticipant(user, ride);

  if (ride.status !== RideStatus.ACCEPTED) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      "Ride must be accepted before marking arrival",
    );
  }

  ride.status = RideStatus.ARRIVED;
  ride.arrivedAt = new Date();
  await ride.save();

  return ride;
};

export const startRide = async (rideId: string, user: IUser) => {
  const ride = await getRideOrThrow(rideId);
  await ensureDriverParticipant(user, ride);

  if (![RideStatus.ACCEPTED, RideStatus.ARRIVED].includes(ride.status)) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      "Ride cannot be started in its current status",
    );
  }

  ride.status = RideStatus.ACTIVE;
  ride.startedAt = new Date();
  await ride.save();

  return ride;
};

export const completeRide = async (rideId: string, user: IUser) => {
  const ride = await getRideOrThrow(rideId);
  const driverProfile = await ensureDriverParticipant(user, ride);

  if (ride.status !== RideStatus.ACTIVE) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      "Ride must be active before completion",
    );
  }

  ride.status = RideStatus.COMPLETED;
  ride.completedAt = new Date();
  ride.finalFare = ride.estimatedFare;
  await ride.save();
  await setDriverAvailabilityById(driverProfile._id, true);

  return ride;
};

export const cancelRide = async (rideId: string, user: IUser) => {
  const ride = await getRideOrThrow(rideId);
  await ensureRideAccess(ride, user);

  if (
    [RideStatus.COMPLETED, RideStatus.CANCELLED, RideStatus.EXPIRED].includes(
      ride.status,
    )
  ) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      "Ride cannot be cancelled in its current status",
    );
  }

  let reason = RideCancellationReason.RIDER_CANCELLED;
  if (
    user.role === UserRole.DRIVER &&
    ride.driverId &&
    !ride.riderId.equals(user._id)
  ) {
    reason = RideCancellationReason.DRIVER_CANCELLED;
  }

  ride.status = RideStatus.CANCELLED;
  ride.cancelledAt = new Date();
  ride.cancellationReason = reason;
  await ride.save();

  if (ride.driverId) {
    await setDriverAvailabilityById(ride.driverId, true);
  }

  return ride;
};
