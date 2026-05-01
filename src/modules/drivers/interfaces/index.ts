import type { Document, Types } from "mongoose";

export enum DriverStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  SUSPENDED = "suspended",
}

export enum DriverKycStatus {
  NOT_STARTED = "not_started",
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum DriverStakingStatus {
  NOT_STAKED = "not_staked",
  STAKED = "staked",
  INSUFFICIENT = "insufficient",
}

export enum VehicleStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum VehicleType {
  STANDARD = "standard",
  PREMIUM = "premium",
  XL = "xl",
  ELECTRIC = "electric",
}

export interface GeoPoint {
  type: "Point";
  coordinates: [number, number];
}

export interface IDriverProfile extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  fullName: string;
  avatarUrl?: string;
  status: DriverStatus;
  isAvailable: boolean;
  currentLocation?: GeoPoint;
  ratingAverage: number;
  ratingCount: number;
  stakingStatus: DriverStakingStatus;
  kycStatus: DriverKycStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVehicle {
  _id: Types.ObjectId;
  driverId: Types.ObjectId;
  make: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  vehicleType: VehicleType;
  status: VehicleStatus;
  createdAt: Date;
  updatedAt: Date;
}
