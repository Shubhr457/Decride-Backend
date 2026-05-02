import type { IDriverDocument, IKycApplication } from '../interfaces';

export const toKycApplicationDto = (application: IKycApplication) => ({
  id: application._id.toString(),
  userId: application.userId.toString(),
  role: application.role,
  provider: application.provider,
  providerApplicantId: application.providerApplicantId,
  status: application.status,
  checks: application.checks,
  did: application.did || null,
  vcId: application.vcId || null,
  rejectionReason: application.rejectionReason || null,
  reviewedBy: application.reviewedBy?.toString() || null,
  reviewedAt: application.reviewedAt || null,
  createdAt: application.createdAt,
  updatedAt: application.updatedAt,
});

export const toDriverDocumentDto = (document: IDriverDocument) => ({
  id: document._id.toString(),
  driverId: document.driverId.toString(),
  type: document.type,
  fileUrl: document.fileUrl,
  ipfsHash: document.ipfsHash || null,
  status: document.status,
  rejectionReason: document.rejectionReason || null,
  createdAt: document.createdAt,
  updatedAt: document.updatedAt,
});
