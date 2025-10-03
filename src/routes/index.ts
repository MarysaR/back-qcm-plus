import { Router } from 'express';
import authRouter from './auth/auth-route';
import userRouter from './user-route';

const router = Router();

router.use('/auth', authRouter);
router.use(userRouter);

export default router;
