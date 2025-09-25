import { AppUser, Role } from '@prisma/client';
import {
  AppError,
  Err,
  NotFoundError,
  Ok,
  Result,
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
    };
  }
}
