import { Router } from 'express';
import authRouter from './auth/auth-route';
import pingRouter from './ping-route';
import userRouter from './user-route';

const router = Router();

router.use('/auth', authRouter);
router.use(pingRouter);
router.use(userRouter);

export default router;
