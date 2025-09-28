import { Request, Response } from 'express';
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
} from 'logic-qcm-plus';
import { QuestionnairePrismaRepository } from '../../repositories/questionnaire-prisma-repository';
import { CatchErrors } from '../../utils/catchErrors';
import { HandleResult } from '../../utils/handleResult';

export class QuestionnaireController {
  @CatchErrors()
  @HandleResult()
  async createQuestionnaire(
    req: Request,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _res: Response
  ): Promise<Result<Questionnaire, AppError>> {
    const { name, description } = req.body || {};

    if (name === undefined) {
      return Err.of(new ValidationError('Champ "name" manquant'));
    }

    const repo: QuestionnaireRepository = new QuestionnairePrismaRepository();
    const useCase = new CreateQuestionnaireUseCase(repo);

    const result = await useCase.execute({ name, description });
    if (result.isErr()) {
      return Err.of(result.error);
    }

    const reload = await repo.getQuestionnaireByName(result.value.name);

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
