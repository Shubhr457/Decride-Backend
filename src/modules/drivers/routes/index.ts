import { Router } from "express";
import { authenticate } from "../../../middlewares/auth";
import { validate } from "../../../middlewares/validate";
import {
  addDriverDocument,
  listMyDriverDocuments,
} from "../../kyc/controllers";
import { driverDocumentSchema } from "../../kyc/validators";
import {
  addVehicle,
  createOrUpdateDriverProfile,
  getMyDriverProfile,
  listVehicles,
  updateAvailability,
  updateLocation,
} from "../controllers";
import {
  createVehicleSchema,
  driverAvailabilitySchema,
  driverLocationSchema,
  upsertDriverProfileSchema,
} from "../validators";

const router = Router();

router.post(
  "/profile",
  authenticate,
  validate({ body: upsertDriverProfileSchema }),
  createOrUpdateDriverProfile,
);
router.get("/me", authenticate, getMyDriverProfile);
router.patch(
  "/availability",
  authenticate,
  validate({ body: driverAvailabilitySchema }),
  updateAvailability,
);
router.patch(
  "/location",
  authenticate,
  validate({ body: driverLocationSchema }),
  updateLocation,
);
router.post(
  "/vehicles",
  authenticate,
  validate({ body: createVehicleSchema }),
  addVehicle,
);
router.get("/vehicles", authenticate, listVehicles);
router.post(
  "/documents",
  authenticate,
  validate({ body: driverDocumentSchema }),
  addDriverDocument,
);
router.get("/documents", authenticate, listMyDriverDocuments);

export default router;
