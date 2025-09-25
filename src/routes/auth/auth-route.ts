import { Router } from 'express';
import { AuthController } from '../../controllers/auth/authController';
import { authMiddleware } from '../../middlewares/authMiddleware';

const authRouter = Router();
const authController = new AuthController();

authRouter.post('/login', authController.login.bind(authController));

authRouter.get('/me', authMiddleware, authController.me.bind(authController));

export default authRouter;
