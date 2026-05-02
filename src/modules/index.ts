import { Router } from "express";
import adminRoutes from "./admin/routes";
import authRoutes from "./auth/routes";
import driverRoutes from "./drivers/routes";
import healthRoutes from "./health/routes";
import kycRoutes from "./kyc/routes";
import riderRoutes from "./riders/routes";
import userRoutes from "./users/routes";

const router = Router();

router.use("/admin", adminRoutes);
router.use("/auth", authRoutes);
router.use("/drivers", driverRoutes);
router.use("/health", healthRoutes);
router.use("/kyc", kycRoutes);
router.use("/riders", riderRoutes);
router.use("/users", userRoutes);

export default router;
