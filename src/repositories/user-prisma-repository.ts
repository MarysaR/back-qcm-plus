import { AppUser, Role } from '@prisma/client';
import {
  AppError,
  Err,
  NotFoundError,
  Ok,
  Result,
  RoleEnum,
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


  

  async getAllUsers(): Promise<Result<User[], AppError>> {
    const rows = await prisma.appUser.findMany({
      include: {
        role: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    if (!rows || rows.length === 0) {
      return Err.of(new NotFoundError('Aucun utilisateur trouvé'));
    }

    const users: User[] = rows.map((row) => ({
      id: row.id_user,
      firstName: row.first_name,
      lastName: row.last_name,
      login: row.login,
      email: row.email,
      password: row.password,
      company: row.company ?? undefined,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      roleId: row.role_id as RoleEnum,
      role: {
        id: row.role.id_role,
        name: row.role.name,
        isActive: row.role.is_active,
        description: row.role.description ?? undefined,
      },
    }));

    return Ok.of(users);
  }


}
