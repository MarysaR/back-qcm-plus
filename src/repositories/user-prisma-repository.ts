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
      firstName: user.first_name,
      lastName: user.last_name,
      login: user.login,
      email: user.email,
      password: user.password,
      company: user.company ?? undefined,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      roleId: user.role_id,
      role: {
        id: user.role.id_role,
        name: user.role.name,
        isActive: user.role.is_active,
        description: user.role.description ?? undefined,
      },
    };
  }

  async createUser(newUser: User): Promise<Result<void, AppError>> {
    const result = await prisma.appUser.create({
      data: {
        first_name: newUser.firstName,
        last_name: newUser.lastName,
        login: newUser.login,
        password: newUser.password,
        company: newUser.company,
        email: newUser.email,
        role: {
          connect: { id_role: newUser.roleId },
        },
        is_active: newUser.isActive,
        created_at: newUser.createdAt,
        updated_at: newUser.updatedAt,
      },
    });

    if (!result) {
      return Err.of(
        new TechnicalError(
          "Erreur technique lors de la création de l'utilisateur."
        )
      );
    }

    return Ok.of(undefined);
  }
}
