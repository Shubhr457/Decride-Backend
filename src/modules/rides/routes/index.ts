import { Router } from 'express';
import { authenticate } from '../../../middlewares/auth';
import { validate } from '../../../middlewares/validate';
import {
  acceptRideController,
  arrivedRideController,
  cancelRideController,
  completeRideController,
  estimateFareController,
  getMyRidesController,
  getRideController,
  rejectRideController,
  requestRideController,
  startRideController,
} from '../controllers';
import { fareEstimateSchema, requestRideSchema, rideIdParamsSchema } from '../validators';

const router = Router();

router.post('/estimate', authenticate, validate({ body: fareEstimateSchema }), estimateFareController);
router.post('/', authenticate, validate({ body: requestRideSchema }), requestRideController);
router.get('/me', authenticate, getMyRidesController);
router.get('/:id', authenticate, validate({ params: rideIdParamsSchema }), getRideController);
router.post('/:id/accept', authenticate, validate({ params: rideIdParamsSchema }), acceptRideController);
router.post('/:id/reject', authenticate, validate({ params: rideIdParamsSchema }), rejectRideController);
router.post('/:id/arrived', authenticate, validate({ params: rideIdParamsSchema }), arrivedRideController);
router.post('/:id/start', authenticate, validate({ params: rideIdParamsSchema }), startRideController);
router.post('/:id/complete', authenticate, validate({ params: rideIdParamsSchema }), completeRideController);
router.post('/:id/cancel', authenticate, validate({ params: rideIdParamsSchema }), cancelRideController);

export default router;
