import prisma from '../config/prisma';
import {
  QuestionnaireRepository,
  Questionnaire,
  Result,
  Ok,
  Err,
  AppError,
  NotFoundError,
  TechnicalError,
  UpdateQuestionnaireCommand,
} from 'logic-qcm-plus';
import { Questionnaire as PrismaQuestionnaire } from '@prisma/client';

export class QuestionnairePrismaRepository implements QuestionnaireRepository {
  async getAllQuestionnaires(): Promise<Result<Questionnaire[], AppError>> {
    const rows = await prisma.questionnaire.findMany({
      orderBy: { created_at: 'desc' },
    });

    if (!rows || rows.length == 0) {
      return Err.of(new NotFoundError('Aucun questionnaire trouvé'));
    }

    const questionnaires: Questionnaire[] = rows.map((row) => ({
      id: row.id_questionnaire,
      name: row.name,
      description: row.description ?? undefined,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return Ok.of(questionnaires);
  }

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

  async updateQuestionnaire(
    command: UpdateQuestionnaireCommand
  ): Promise<Result<Questionnaire, AppError>> {
    const existing = await prisma.questionnaire.findUnique({
      where: { id_questionnaire: command.id },
    });

    if (!existing) {
      return Err.of(new NotFoundError('Questionnaire introuvable'));
    }

    const updated = await prisma.questionnaire.update({
      where: { id_questionnaire: command.id },
      data: {
        name: command.name,
        ...(command.description != undefined && {
          description: command.description || null,
        }),
        updated_at: new Date(),
      },
    });

    if (!updated) {
      return Err.of(
        new TechnicalError(
          'Erreur technique lors de la mise à jour du questionnaire'
        )
      );
    }

    return Ok.of({
      id: updated.id_questionnaire,
      name: updated.name,
      description: updated.description ?? undefined,
      isActive: updated.is_active,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    });
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
