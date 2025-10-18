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
  GetQuestionnaireByIdUseCase,
  PermissionDeniedError,
  GetAllQuestionnairesUseCase,
  UpdateQuestionnaireUseCase,
  UpdateQuestionnaireCommand,
} from 'logic-qcm-plus';
import { QuestionnairePrismaRepository } from '../../repositories/questionnaire-prisma-repository';

export class QuestionnaireController {
  @CatchErrors()
  @HandleResult()
  async getAllQuestionnaires(
    req: Request,
    _res: Response
  ): Promise<Result<Questionnaire[], AppError>> {
    const currentUser = claimsToUser(req.claims);

    if (!currentUser) {
      return Err.of(new PermissionDeniedError('Utilisateur non authentifié'));
    }

    const questionnaireRepository: QuestionnaireRepository =
      new QuestionnairePrismaRepository();
    const getAllQuestionnairesUseCase = new GetAllQuestionnairesUseCase(
      questionnaireRepository
    );

    const result = await getAllQuestionnairesUseCase.execute(currentUser);

    if (result.isErr()) {
      return Err.of(result.error);
    }

    return Ok.of(result.value);
  }

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

  @CatchErrors()
  @HandleResult()
  async updateQuestionnaire(
    req: Request,
    _res: Response
  ): Promise<Result<Questionnaire, AppError>> {
    const idParam = Number(req.params.id);
    if (!req.params.id || isNaN(idParam) || idParam <= 0) {
      return Err.of(
        new ValidationError('Identifiant de questionnaire invalide')
      );
    }

    const { name, description } = req.body;
    if (typeof name != 'string') {
      return Err.of(
        new ValidationError('Le nom du questionnaire est invalide')
      );
    }

    const currentUser = claimsToUser(req.claims);
    if (!currentUser) {
      return Err.of(new PermissionDeniedError('Utilisateur non authentifié'));
    }

    const command: UpdateQuestionnaireCommand = {
      id: idParam,
      name,
      ...(description !== undefined && { description }),
      updatedAt: new Date(),
    };

    const useCase = new UpdateQuestionnaireUseCase(
      new QuestionnairePrismaRepository()
    );

    const result = await useCase.execute(currentUser, command);
    if (result.isErr()) {
      return Err.of(result.error);
    }

    return Ok.of(result.value);
  }
}
