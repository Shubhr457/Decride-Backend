import type { FareBreakdown, IRide } from '../interfaces';

export const toFareEstimateDto = (
  estimatedDistanceKm: number,
  estimatedDurationMin: number,
  fareBreakdown: FareBreakdown,
) => ({
  estimatedDistanceKm,
  estimatedDurationMin,
  estimatedFare: fareBreakdown.totalFare,
  fareBreakdown,
});

export const toRideDto = (ride: IRide) => ({
  id: ride._id.toString(),
  riderId: ride.riderId.toString(),
  driverId: ride.driverId?.toString() || null,
  status: ride.status,
  pickupLocation: ride.pickupLocation,
  dropoffLocation: ride.dropoffLocation,
  pickupAddress: ride.pickupAddress || null,
  dropoffAddress: ride.dropoffAddress || null,
  vehicleType: ride.vehicleType || null,
  estimatedDistanceKm: ride.estimatedDistanceKm,
  estimatedDurationMin: ride.estimatedDurationMin,
  estimatedFare: ride.estimatedFare,
  finalFare: ride.finalFare || null,
  fareBreakdown: ride.fareBreakdown,
  paymentToken: ride.paymentToken,
  onChainRideId: ride.onChainRideId || null,
  metadataHash: ride.metadataHash || null,
  cancellationReason: ride.cancellationReason || null,
  requestedAt: ride.requestedAt,
  matchedAt: ride.matchedAt || null,
  acceptedAt: ride.acceptedAt || null,
  arrivedAt: ride.arrivedAt || null,
  startedAt: ride.startedAt || null,
  completedAt: ride.completedAt || null,
  cancelledAt: ride.cancelledAt || null,
  expiredAt: ride.expiredAt || null,
  createdAt: ride.createdAt,
  updatedAt: ride.updatedAt,
});
