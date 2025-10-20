/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from 'express';
import {
  CreateQuestionUseCase,
  CreateQuestionCommand,
  ValidationError,
  Err,
  Ok,
  GetQuestionsOfQuestionnaireUseCase,
  PermissionDeniedError,
  Result,
  Question,
  AppError,
  UpdateQuestionUseCase,
  GetQuestionByIdUseCase,
  DeleteQuestionUseCase,
} from 'logic-qcm-plus';
import { CatchErrors } from '../../utils/catchErrors';
import { HandleResult } from '../../utils/handleResult';
import { QuestionPrismaRepository } from '../../repositories/question-prisma-repository';
import { claimsToUser } from '../../utils/claimsToUser';

export class QuestionController {
  @CatchErrors()
  @HandleResult()
  async getQuestionsOfQuestionnaire(
    req: Request,
    _res: Response
  ): Promise<Result<Question[], AppError>> {
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
    if (result.isErr()) {
      return Err.of(result.error);
    }

    return result;
  }

  @CatchErrors()
  @HandleResult()
  async getQuestionById(
    req: Request,
    _res: Response
  ): Promise<Result<Question, AppError>> {
    if (!req.claims) {
      return Err.of(new PermissionDeniedError('Utilisateur non authentifié'));
    }

    const id = Number(req.params.id);
    if (!id || id <= 0 || isNaN(id)) {
      return Err.of(new ValidationError('Identifiant de question invalide'));
    }

    const currentUser = claimsToUser(req.claims);
    const useCase = new GetQuestionByIdUseCase(new QuestionPrismaRepository());

    const result = await useCase.execute(currentUser, id);
    if (result.isErr()) {
      return Err.of(result.error);
    }

    return result;
  }

  @CatchErrors()
  @HandleResult()
  async createQuestion(
    req: Request,
    res: Response
  ): Promise<Result<void, AppError>> {
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
    if (result.isErr()) {
      return Err.of(result.error);
    }

    return Ok.of(undefined);
  }

  @CatchErrors()
  @HandleResult()
  async updateQuestion(
    req: Request,
    _res: Response
  ): Promise<Result<Question, AppError>> {
    if (!req.claims) {
      return Err.of(new PermissionDeniedError('Utilisateur non authentifié'));
    }

    const questionId = Number(req.params.id);
    if (!req.params.id || isNaN(questionId) || questionId <= 0) {
      return Err.of(new ValidationError('Identifiant de question invalide'));
    }

    const { label, questionnaireId, answers } = req.body;
    if (typeof label != 'string') {
      return Err.of(
        new ValidationError('Le libellé de la question est invalide')
      );
    }

    if (typeof questionnaireId != 'number') {
      return Err.of(
        new ValidationError('Identifiant de questionnaire invalide')
      );
    }

    if (!Array.isArray(answers)) {
      return Err.of(new ValidationError('Les réponses sont invalides'));
    }

    const updateQuestionUseCase = new UpdateQuestionUseCase(
      new QuestionPrismaRepository()
    );
    const currentUser = claimsToUser(req.claims);

    const result = await updateQuestionUseCase.execute(currentUser, {
      ...req.body,
      questionId,
      updatedAt: new Date(),
    });

    if (result.isErr()) {
      return Err.of(result.error);
    }

    return Ok.of(result.value);
  }

  @CatchErrors()
  @HandleResult()
  async deleteQuestion(
    req: Request,
    _res: Response
  ): Promise<Result<void, AppError>> {
    if (!req.claims) {
      return Err.of(new PermissionDeniedError('Utilisateur non authentifié'));
    }

    const questionId = Number(req.params.id);
    if (!req.params.id || isNaN(questionId) || questionId <= 0) {
      return Err.of(new ValidationError('Identifiant de question invalide'));
    }

    const currentUser = claimsToUser(req.claims);
    const deleteQuestionUseCase = new DeleteQuestionUseCase(
      new QuestionPrismaRepository()
    );

    const result = await deleteQuestionUseCase.execute(currentUser, questionId);
    if (result.isErr()) {
      return Err.of(result.error);
    }

    return Ok.of(undefined);
  }
}
