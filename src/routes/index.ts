import { Router } from 'express';
import pingRouter from './ping-route';
import userRouter from './user-route';

const router = Router();

router.use(pingRouter);
router.use(userRouter);

export default router;
