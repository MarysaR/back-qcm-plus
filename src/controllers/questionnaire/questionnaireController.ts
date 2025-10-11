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
      if (result.error instanceof NotFoundError) {
        return Err.of(
          new NotFoundError('Questionnaire introuvable dans la base de données')
        );
      }
      return Err.of(result.error);
    }

    return Ok.of(result.value);
  }

  @CatchErrors()
  @HandleResult()
  async createQuestionnaire(
    req: Request,
    _res: Response
  ): Promise<Result<Questionnaire, AppError>> {
    const { name, description } = req.body || {};

    if (name == undefined) {
      return Err.of(new ValidationError('Champ "name" manquant'));
    }

    const questionnaireRepository: QuestionnaireRepository =
      new QuestionnairePrismaRepository();
    const createQuestionnaireUseCase = new CreateQuestionnaireUseCase(
      questionnaireRepository
    );

    const result = await createQuestionnaireUseCase.execute({
      name,
      description,
    });
    if (result.isErr()) {
      return Err.of(result.error);
    }

    const reload = await questionnaireRepository.getQuestionnaireByName(
      result.value.name
    );

    if (reload.isOk()) {
      return Ok.of(reload.value);
    }

    if (reload.isErr() && reload.error instanceof NotFoundError) {
      return Ok.of(result.value);
    }

    if (reload.isErr()) {
      return Err.of(reload.error);
    }

    return Ok.of(result.value);
  }
}
