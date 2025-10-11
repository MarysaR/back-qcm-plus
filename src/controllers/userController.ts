import { Request, Response } from 'express';
import { CreateUserUseCase, PasswordHasher } from 'logic-qcm-plus';
import { UserPrismaRepository } from '../repositories/user-prisma-repository';
import { HTTP_STATUS } from '../constants/httpStatus';
import { BcryptPasswordHasher } from '../providers/bcryptPasswordHasher';

export class UserController {
  private userRepository = new UserPrismaRepository();
  private passwordHasher: PasswordHasher = new BcryptPasswordHasher();
  private createUserUseCase = new CreateUserUseCase(
    this.userRepository,
    this.passwordHasher
  );

  public async createUser(req: Request, res: Response): Promise<void> {
    const user = req.body;
    const curentUserRoleId = req.body.currentUserRoleId;

    if (!curentUserRoleId || curentUserRoleId !== 1) {
      res
        .status(HTTP_STATUS.FORBIDDEN)
        .json({ error: 'Accès interdit : rôle ADMIN requis.' });
      return;
    }

    const result = await this.createUserUseCase.createUser(
      curentUserRoleId,
      user
    );

    if (result.isErr()) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ error: result.error.message });
    } else {
      res
        .status(HTTP_STATUS.CREATED)
        .json({ message: 'Utilisateur créé avec succès' });
    }
  }
}
