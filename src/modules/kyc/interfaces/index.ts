import type { Document, Types } from 'mongoose';
import type { UserRole } from '../../users/interfaces';

export enum KycProvider {
  MOCK = 'mock',
  ONFIDO = 'onfido',
  PERSONA = 'persona',
}

export enum KycStatus {
  NOT_STARTED = 'not_started',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum DriverDocumentType {
  LICENSE = 'license',
  INSURANCE = 'insurance',
  REGISTRATION = 'registration',
  VEHICLE_INSPECTION = 'vehicle_inspection',
}

export enum DriverDocumentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface IKycApplication extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  role: UserRole;
  provider: KycProvider;
  providerApplicantId: string;
  status: KycStatus;
  checks: Record<string, unknown>[];
  did?: string;
  vcId?: string;
  rejectionReason?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDriverDocument extends Document {
  _id: Types.ObjectId;
  driverId: Types.ObjectId;
  type: DriverDocumentType;
  fileUrl: string;
  ipfsHash?: string;
  status: DriverDocumentStatus;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}
