import { Router } from 'express';
import { databaseHealthCheck, healthCheck } from '../controllers';

const router = Router();

router.get('/', healthCheck);
router.get('/db', databaseHealthCheck);

export default router;
