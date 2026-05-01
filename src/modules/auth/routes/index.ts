import { Router } from 'express';
import { authenticate } from '../../../middlewares/auth';
import { validate } from '../../../middlewares/validate';
import { getMe, logout, requestNonce, verifyWallet } from '../controllers';
import { nonceRequestSchema, verifyWalletRequestSchema } from '../validators';

const router = Router();

router.post('/nonce', validate({ body: nonceRequestSchema }), requestNonce);
router.post('/verify', validate({ body: verifyWalletRequestSchema }), verifyWallet);
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);

export default router;
