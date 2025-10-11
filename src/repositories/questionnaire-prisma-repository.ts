import prisma from '../config/prisma';
import {
  QuestionnaireRepository,
  Questionnaire,
  Result,
  Ok,
  Err,
  AppError,
  NotFoundError,
} from 'logic-qcm-plus';
import { Questionnaire as PrismaQuestionnaire } from '@prisma/client';

export class QuestionnairePrismaRepository implements QuestionnaireRepository {
  async getQuestionnaireById(
    id: number
  ): Promise<Result<Questionnaire, AppError>> {
    const row = await prisma.questionnaire.findUnique({
      where: { id_questionnaire: id },
    });
    if (!row) {
      return Err.of(new NotFoundError('Questionnaire introuvable'));
    }

    return Ok.of(this.map(row));
  }

  async getQuestionnaireByName(
    name: string
  ): Promise<Result<Questionnaire, AppError>> {
    const row = await prisma.questionnaire.findUnique({ where: { name } });
    if (!row)
      return Err.of(new NotFoundError(`Questionnaire "${name}" non trouvé`));
    return Ok.of(this.map(row));
  }

  async createQuestionnaire(q: Questionnaire): Promise<Result<void, AppError>> {
    await prisma.questionnaire.create({
      data: {
        name: q.name,
        description: q.description ?? null,
        is_active: q.isActive ?? true,
      },
    });
    return Ok.of(undefined);
  }

  private map(row: PrismaQuestionnaire): Questionnaire {
    return {
      id: row.id_questionnaire,
      name: row.name,
      description: row.description ?? undefined,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
