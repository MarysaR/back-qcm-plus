import { Router } from 'express';
import { QuestionController } from '../../controllers/question/questionController';
import { authMiddleware } from '../../middlewares/authMiddleware';

const questionRouter = Router();
const questionController = new QuestionController();

questionRouter.get(
  '/questionnaire/:id/questions',
  authMiddleware,
  questionController.getQuestionsOfQuestionnaire.bind(questionController)
);

questionRouter.get(
  '/questions/:id',
  authMiddleware,
  questionController.getQuestionById.bind(questionController)
);

questionRouter.post(
  '/questions',
  authMiddleware,
  questionController.createQuestion.bind(questionController)
);

questionRouter.put(
  '/questions/:id',
  authMiddleware,
  questionController.updateQuestion.bind(questionController)
);

export default questionRouter;
