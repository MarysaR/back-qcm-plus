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
import { UpdateQuestionCommand } from 'logic-qcm-plus/dist/commands/question/updateQuestionCommand';

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
      return Ok.of([]);
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

  async getQuestionById(id: number): Promise<Result<Question, AppError>> {
    const row = await prisma.question.findUnique({
      where: { id_question: id },
      include: {
        answers: true,
        questionnaireLinks: true,
      },
    });

    if (!row) {
      return Err.of(new NotFoundError('Question introuvable'));
    }

    const questionnaireId =
      row.questionnaireLinks && row.questionnaireLinks.length > 0
        ? row.questionnaireLinks[0].questionnaire_id
        : 0;

    const question: Question = {
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
    };

    return Ok.of(question);
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

  async updateQuestion(
    command: UpdateQuestionCommand
  ): Promise<Result<Question, AppError>> {
    const existingQuestion = await prisma.question.findUnique({
      where: { id_question: command.questionId },
      include: { answers: true },
    });

    if (!existingQuestion) {
      return Err.of(new NotFoundError('Question introuvable'));
    }

    const updatedQuestion = await prisma.question.update({
      where: { id_question: command.questionId },
      data: {
        title: command.label,
        updated_at: command.updatedAt,
      },
    });

    if (!updatedQuestion) {
      return Err.of(
        new TechnicalError(
          'Erreur technique lors de la mise à jour de la question'
        )
      );
    }

    const deleteResult = await prisma.answer.deleteMany({
      where: { question_id: command.questionId },
    });

    if (deleteResult.count == 0 && existingQuestion.answers.length > 0) {
      return Err.of(
        new TechnicalError(
          'Erreur technique lors de la suppression des réponses existantes'
        )
      );
    }

    const createResult = await prisma.answer.createMany({
      data: command.answers.map((a, index) => ({
        text: a.text,
        is_correct: a.isCorrect,
        display_order: index,
        question_id: command.questionId,
      })),
    });

    if (createResult.count == 0) {
      return Err.of(
        new TechnicalError(
          'Erreur technique lors de la création des nouvelles réponses'
        )
      );
    }

    const refreshed = await prisma.question.findUnique({
      where: { id_question: command.questionId },
      include: { answers: true },
    });

    if (!refreshed) {
      return Err.of(
        new TechnicalError(
          'Erreur technique lors du rechargement de la question'
        )
      );
    }

    return Ok.of({
      id: refreshed.id_question,
      label: refreshed.title,
      questionnaireId: command.questionnaireId,
      answers: refreshed.answers.map((a) => ({
        id: a.id_answer,
        text: a.text,
        isCorrect: a.is_correct,
        questionId: a.question_id,
        createdAt: a.created_at,
        updatedAt: a.updated_at,
      })),
      createdAt: refreshed.created_at,
      updatedAt: refreshed.updated_at,
    });
  }

  async deleteQuestion(id: number): Promise<Result<void, AppError>> {
    const existing = await prisma.question.findUnique({
      where: { id_question: id },
      include: { answers: true, questionnaireLinks: true },
    });
    if (!existing) {
      return Err.of(new NotFoundError('Question introuvable'));
    }

    await prisma.$transaction(async (tx) => {
      await tx.answer.deleteMany({
        where: { question_id: id },
      });

      await tx.questionnaireQuestion.deleteMany({
        where: { question_id: id },
      });

      return await tx.question.delete({
        where: { id_question: id },
      });
    });

    return Ok.of(undefined);
  }
}
