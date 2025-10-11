/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from 'express';
import {
  CreateQuestionUseCase,
  CreateQuestionCommand,
  ValidationError,
  Err,
  Ok,
} from 'logic-qcm-plus';
import { CatchErrors } from '../../utils/catchErrors';
import { HandleResult } from '../../utils/handleResult';
import { QuestionPrismaRepository } from '../../repositories/question-prisma-repository';
import { claimsToUser } from '../../utils/claimsToUser';

export class QuestionController {
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
    if (result.isErr()) {
      return result;
    }

    return Ok.of(undefined);
  }
}
