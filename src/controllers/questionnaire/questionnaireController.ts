/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from 'express';
import { CatchErrors } from '../../utils/catchErrors';
import { HandleResult } from '../../utils/handleResult';
import { claimsToUser } from '../../utils/claimsToUser';
import {
  CreateQuestionnaireUseCase,
  Questionnaire,
  QuestionnaireRepository,
  Result,
  AppError,
  Ok,
  Err,
  ValidationError,
  NotFoundError,
  GetQuestionnaireByIdUseCase,
  PermissionDeniedError,
} from 'logic-qcm-plus';
import { QuestionnairePrismaRepository } from '../../repositories/questionnaire-prisma-repository';

export class QuestionnaireController {
  @CatchErrors()
  @HandleResult()
  async getQuestionnaireById(
    req: Request,
    _res: Response
  ): Promise<Result<Questionnaire, AppError>> {
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

    const questionnaireRepository: QuestionnaireRepository =
      new QuestionnairePrismaRepository();
    const getQuestionnaireByIdUseCase = new GetQuestionnaireByIdUseCase(
      questionnaireRepository
    );

    const result = await getQuestionnaireByIdUseCase.execute(
      currentUser,
      Number(id)
    );

    if (result.isErr()) {
      return Err.of(result.error);
    }

    return Ok.of(result.value);
  }

  @CatchErrors()
  @HandleResult()
  async createQuestionnaire(
    req: Request,
    _res: Response
  ): Promise<Result<void, AppError>> {
    const { name, description } = req.body || {};
    const currentUser = claimsToUser(req.claims);

    if (name == undefined) {
      return Err.of(new ValidationError('Champ "name" manquant'));
    }

    if (!currentUser) {
      return Err.of(new PermissionDeniedError('Utilisateur non authentifié'));
    }

    const questionnaireRepository: QuestionnaireRepository =
      new QuestionnairePrismaRepository();
    const createQuestionnaireUseCase = new CreateQuestionnaireUseCase(
      questionnaireRepository
    );

    const result = await createQuestionnaireUseCase.execute(currentUser, {
      name,
      description,
    });

    if (result.isErr()) {
      return Err.of(result.error);
    }

    return Ok.of(undefined);
  }
}
