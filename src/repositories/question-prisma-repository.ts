import {
  QUESTION_ORDER_INCREMENT,
  INITIAL_QUESTION_ORDER,
} from '../constants/questionConstants';
import {
  AppError,
  Err,
  Ok,
  Result,
  QuestionRepository,
  TechnicalError,
  CreateQuestionCommand,
  CreateAnswerCommand,
} from 'logic-qcm-plus';

import prisma from '../config/prisma';

export class QuestionPrismaRepository implements QuestionRepository {
  async createQuestion(
    command: CreateQuestionCommand
  ): Promise<Result<void, AppError>> {
    const lastOrder = await prisma.questionnaireQuestion.findFirst({
      where: { questionnaire_id: command.questionnaireId },
      orderBy: { question_order: 'desc' },
    });

    const nextOrder = lastOrder
      ? lastOrder.question_order + QUESTION_ORDER_INCREMENT
      : INITIAL_QUESTION_ORDER;

    const result = await prisma.question.create({
      data: {
        title: command.label,
        questionnaireLinks: {
          create: {
            questionnaire_id: command.questionnaireId,
            question_order: nextOrder,
          },
        },
        answers: {
          create: command.answers.map(
            (a: CreateAnswerCommand, index: number) => ({
              text: a.text,
              is_correct: a.isCorrect,
              display_order: index,
            })
          ),
        },
      },
    });

    if (!result) {
      return Err.of(
        new TechnicalError(
          'Erreur technique lors de la création de la question'
        )
      );
    }

    return Ok.of(undefined);
  }
}
