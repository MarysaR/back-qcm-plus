import { Router } from 'express';
import authRouter from './auth/auth-route';
import userRouter from './user-route';
import questionnaireRouter from './questionnaire/questionnaire-route';
import questionRouter from './question/question-route';

const router = Router();

router.use('/auth', authRouter);
router.use(userRouter);
router.use(questionnaireRouter);
router.use(questionRouter);

export default router;
