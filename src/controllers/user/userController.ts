import { Request, Response } from 'express';
import { CreateUserUseCase, PasswordHasher, RoleEnum } from 'logic-qcm-plus';
import { UserPrismaRepository } from '../../repositories/user-prisma-repository';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { BcryptPasswordHasher } from '../../providers/bcryptPasswordHasher';
import { claimsToUser } from '../../utils/claimsToUser';

export class UserController {
  private userRepository = new UserPrismaRepository();
  private passwordHasher: PasswordHasher = new BcryptPasswordHasher();
  private createUserUseCase = new CreateUserUseCase(
    this.userRepository,
    this.passwordHasher
  );

  public async createUser(req: Request, res: Response): Promise<void> {
    const user = req.body;

    const curentUserRoleId = claimsToUser(req.claims).roleId;

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