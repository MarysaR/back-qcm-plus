import { Router } from 'express';
import { PingController } from '../controllers/pingController';

const pingRouter = Router();
const pingController = new PingController();

/**
 * @route GET /ping
 * @desc Répond "pong"
 * @access Public
 */
pingRouter.get('/ping', (req, res) => {
  pingController.getPing(req, res);
});

export default pingRouter;
