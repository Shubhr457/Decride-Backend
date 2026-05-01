import mongoose, { Schema } from 'mongoose';
import { VehicleStatus, VehicleType } from '../interfaces';
import type { IVehicle } from '../interfaces';

const vehicleSchema = new Schema<IVehicle>(
  {
    driverId: {
      type: Schema.Types.ObjectId,
      ref: 'DriverProfile',
      required: true,
      index: true,
    },
    make: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    model: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    year: {
      type: Number,
      required: true,
      min: 1990,
      max: 2100,
    },
    color: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
    },
    plateNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    vehicleType: {
      type: String,
      enum: Object.values(VehicleType),
      default: VehicleType.STANDARD,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(VehicleStatus),
      default: VehicleStatus.PENDING,
      index: true,
    },
  },
  { timestamps: true },
);

vehicleSchema.index({ driverId: 1, plateNumber: 1 }, { unique: true });

export const VehicleModel = mongoose.model<IVehicle>('Vehicle', vehicleSchema);
