import { Router } from 'express';
import { QuestionnaireController } from '../../controllers/questionnaire/questionnaireController';

const questionnaireRouter = Router();
const questionnaireController = new QuestionnaireController();

questionnaireRouter.post(
  '/createQuestionnaire',
  questionnaireController.createQuestionnaire.bind(questionnaireController)
);

export default questionnaireRouter;
