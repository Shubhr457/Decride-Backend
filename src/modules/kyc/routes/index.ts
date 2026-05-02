import { Router } from 'express';
import { authenticate } from '../../../middlewares/auth';
import { validate } from '../../../middlewares/validate';
import { getMyKyc, receiveKycWebhook, startKyc } from '../controllers';
import { startKycSchema } from '../validators';

const router = Router();

router.post('/start', authenticate, validate({ body: startKycSchema }), startKyc);
router.get('/me', authenticate, getMyKyc);
router.post('/webhook', receiveKycWebhook);

export default router;
