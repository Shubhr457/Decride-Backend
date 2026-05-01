import { Router } from 'express';
import { authenticate } from '../../../middlewares/auth';
import { validate } from '../../../middlewares/validate';
import { updateMe } from '../controllers';
import { updateCurrentUserSchema } from '../validators';

const router = Router();

router.patch('/me', authenticate, validate({ body: updateCurrentUserSchema }), updateMe);

export default router;
