import { Router } from 'express';
import { QuestionnaireController } from '../../controllers/questionnaire/questionnaireController';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { QuestionController } from '../../controllers/question/questionController';

const questionnaireController = new QuestionnaireController();
const questionController = new QuestionController();

const questionnaireRouter = Router();

questionnaireRouter.get(
  '/questionnaire/:id/questions',
  authMiddleware,
  questionController.getQuestionsOfQuestionnaire.bind(questionController)
);

questionnaireRouter.get(
  '/questionnaire/:id',
  authMiddleware,
  questionnaireController.getQuestionnaireById.bind(questionnaireController)
);

questionnaireRouter.post(
  '/questionnaire',
  authMiddleware,
  questionnaireController.createQuestionnaire.bind(questionnaireController)
);

export default questionnaireRouter;
