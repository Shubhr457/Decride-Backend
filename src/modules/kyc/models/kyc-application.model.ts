import mongoose, { Schema, type SchemaDefinitionProperty } from "mongoose";
import { UserRole } from "../../users/interfaces";
import { KycProvider, KycStatus } from "../interfaces";
import type { IKycApplication } from "../interfaces";

const kycApplicationSchema = new Schema<IKycApplication>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: [UserRole.RIDER, UserRole.DRIVER],
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: Object.values(KycProvider),
      default: KycProvider.MOCK,
    },
    providerApplicantId: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(KycStatus),
      default: KycStatus.PENDING,
      index: true,
    },
    checks: {
      type: [Schema.Types.Mixed],
      default: [],
    } as unknown as SchemaDefinitionProperty<Record<string, unknown>[]>,
    did: {
      type: String,
      trim: true,
    },
    vcId: {
      type: String,
      trim: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

kycApplicationSchema.index({ userId: 1, role: 1 }, { unique: true });

export const KycApplicationModel = mongoose.model<IKycApplication>(
  "KycApplication",
  kycApplicationSchema,
);
