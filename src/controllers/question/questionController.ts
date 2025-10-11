/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from 'express';
import {
  CreateQuestionUseCase,
  CreateQuestionCommand,
  ValidationError,
  Err,
  Ok,
  GetQuestionsOfQuestionnaireUseCase,
  NotFoundError,
  PermissionDeniedError,
} from 'logic-qcm-plus';
import { CatchErrors } from '../../utils/catchErrors';
import { HandleResult } from '../../utils/handleResult';
import { QuestionPrismaRepository } from '../../repositories/question-prisma-repository';
import { claimsToUser } from '../../utils/claimsToUser';

export class QuestionController {
  @CatchErrors()
  @HandleResult()
  async getQuestionsOfQuestionnaire(req: Request, _res: Response) {
    const { id } = req.params;
    const currentUser = claimsToUser(req.claims);

    if (!id || Number(id) <= 0 || isNaN(Number(id))) {
      return Err.of(
        new ValidationError('Identifiant de questionnaire invalide')
      );
    }

    if (!currentUser) {
      return Err.of(new PermissionDeniedError('Utilisateur non authentifié'));
    }

    const getQuestionsOfQuestionnaireUseCase =
      new GetQuestionsOfQuestionnaireUseCase(new QuestionPrismaRepository());

    const result = await getQuestionsOfQuestionnaireUseCase.execute(
      currentUser,
      Number(id)
    );

    return result;
  }

  @CatchErrors()
  @HandleResult()
  async createQuestion(req: Request, res: Response) {
    const { label, questionnaireId, answers } = req.body;
    if (
      typeof label != 'string' ||
      typeof questionnaireId != 'number' ||
      !Array.isArray(answers)
    ) {
      return Err.of(new ValidationError('Données de question invalides'));
    }

    const command: CreateQuestionCommand = {
      label,
      questionnaireId,
      answers,
    };

    const createQuestionUseCase = new CreateQuestionUseCase(
      new QuestionPrismaRepository()
    );

    const currentUser = claimsToUser(req.claims);

    const result = await createQuestionUseCase.execute(currentUser, command);

    return result;
  }
}
