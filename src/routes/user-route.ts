import { Router } from 'express';
import { UserController } from '../controllers/userController';

const userRouter = Router();
const userController = new UserController();

/**
 * @route GET /users
 * @desc Récupère tous les utilisateurs (pagination)
 * @access Public (pas de middleware ici)
 */
userRouter.get('/users', (req, res) => {
  userController.getUsers(req, res);
});

export default userRouter;
