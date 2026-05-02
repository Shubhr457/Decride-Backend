import { Router } from 'express';
import { authenticate, authorizeRoles } from '../../../middlewares/auth';
import { validate } from '../../../middlewares/validate';
import { UserRole } from '../../users/interfaces';
import { listKyc, reviewKycController, updateDriverStatusController } from '../controllers';
import { objectIdParamsSchema, reviewKycSchema, updateDriverStatusSchema } from '../validators';

const router = Router();

router.use(authenticate, authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN));
router.get('/kyc', listKyc);
router.patch('/kyc/:id/review', validate({ params: objectIdParamsSchema, body: reviewKycSchema }), reviewKycController);
router.patch('/drivers/:id/status', validate({ params: objectIdParamsSchema, body: updateDriverStatusSchema }), updateDriverStatusController);

export default router;
