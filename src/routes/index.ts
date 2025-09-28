import { Router } from 'express';
import authRouter from './auth/auth-route';
import pingRouter from './ping-route';
import userRouter from './user-route';
import questionnaireRouter from './questionnaire/questionnaire-route';

const router = Router();

router.use('/auth', authRouter);
router.use(pingRouter);
router.use(userRouter);
router.use('/questionnaire', questionnaireRouter);

export default router;
