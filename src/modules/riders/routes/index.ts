import { Router } from 'express';
import { authenticate } from '../../../middlewares/auth';
import { validate } from '../../../middlewares/validate';
import { createOrUpdateRiderProfile, getMyRiderProfile } from '../controllers';
import { upsertRiderProfileSchema } from '../validators';

const router = Router();

router.post('/profile', authenticate, validate({ body: upsertRiderProfileSchema }), createOrUpdateRiderProfile);
router.get('/me', authenticate, getMyRiderProfile);

export default router;
