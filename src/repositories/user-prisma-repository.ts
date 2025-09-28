import { AppUser, Role } from '@prisma/client';
import {
  AppError,
  Err,
  NotFoundError,
  Ok,
  Result,
  TechnicalError,
  User,
  UserRepository,
  ValidationError,
} from 'logic-qcm-plus';
import prisma from '../config/prisma';

export class UserPrismaRepository implements UserRepository {
  async getUserByEmail(email: string): Promise<Result<User, AppError>> {
    const user = await prisma.appUser.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      return Err.of(
        new NotFoundError(`Utilisateur avec l'email ${email} non trouvé`)
      );
    }

    return Ok.of(this.mapToDomain(user));
  }

  async getCurrentUser(userEmail: string): Promise<Result<User, AppError>> {
    const user = await prisma.appUser.findUnique({
      where: { email: userEmail },
      include: { role: true },
    });

    if (!user) {
      return Err.of(
        new NotFoundError(
          `Utilisateur courant avec l'email ${userEmail} non trouvé`
        )
      );
    }

    return Ok.of(this.mapToDomain(user));
  }

  private mapToDomain(user: AppUser & { role: Role }): User {
    return {
      id: user.id_user,
      login: user.login,
      email: user.email,
      password: user.password,
      isActive: user.is_active,
      roleId: user.role_id,
      role: {
        id: user.role.id_role,
        name: user.role.name,
        isActive: user.role.is_active,
        description: user.role.description ?? undefined,
      },
      company: user.company ?? '',
      firstName: user.first_name,
      lastName: user.last_name,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  async createUser(
    user: User
  ): Promise<Ok<void, AppError> | Err<void, AppError>> {
    console.log('createUser called with:', user);

    const result = await prisma.appUser
      .create({
        data: {
          first_name: user.firstName,
          last_name: user.lastName,
          login: user.login,
          password: user.password,
          company: user.company,
          email: user.email,
          role: {
            connect: { id_role: user.roleId },
          },
          is_active: user.isActive,
          created_at: user.createdAt,
          updated_at: user.updatedAt,
        },
      })
      .then(() => Ok.of(undefined))
      .catch((error: any) => {
        console.error('Erreur Prisma lors de la création du user :', error);

        if (error.code === 'P2002') {
          return Err.of(
            new ValidationError(
              `Un utilisateur avec cet email ou login existe déjà.`
            )
          );
        }

        return Err.of(
          new TechnicalError(
            `Erreur lors de la création de l'utilisateur : ${error.message}`
          )
        );
      });

    return result as Ok<void, AppError> | Err<void, AppError>;
  }
}
