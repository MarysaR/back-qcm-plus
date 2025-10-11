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
  Question,
  NotFoundError,
} from 'logic-qcm-plus';

import prisma from '../config/prisma';

export class QuestionPrismaRepository implements QuestionRepository {
  async getQuestionsOfQuestionnaire(
    questionnaireId: number
  ): Promise<Result<Question[], AppError>> {
    const rows = await prisma.question.findMany({
      where: {
        questionnaireLinks: {
          some: { questionnaire_id: questionnaireId },
        },
      },
      include: {
        answers: true,
      },
      orderBy: {
        id_question: 'asc',
      },
    });

    if (!rows || rows.length == 0) {
      return Err.of(
        new NotFoundError('Aucune question trouvée pour ce questionnaire')
      );
    }

    return Ok.of(
      rows.map((row) => ({
        id: row.id_question,
        label: row.title,
        questionnaireId,
        answers: row.answers.map((a) => ({
          id: a.id_answer,
          text: a.text,
          isCorrect: a.is_correct,
          questionId: a.question_id,
          createdAt: a.created_at,
          updatedAt: a.updated_at,
        })),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }))
    );
  }

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
