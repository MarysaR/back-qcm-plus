import { Router } from 'express';
import { UserController } from '../../controllers/user/userController';
import { authMiddleware } from '../../middlewares/authMiddleware';

const userRouter = Router();
const userController = new UserController();

userRouter.post(
  '/users',
  authMiddleware,
  userController.createUser.bind(userController)
);

userRouter.get(
  '/users',
  authMiddleware,
  userController.getAllUsers.bind(userController)
);

export default userRouter;
