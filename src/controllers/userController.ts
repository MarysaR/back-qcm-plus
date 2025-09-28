import { Request, Response } from 'express';
import { GetUsersUseCase, CreateUserUseCase, RoleEnum } from 'logic-qcm-plus';
import { UserPrismaRepository } from '../repositories/user-prisma-repository';
import { ValidationError, AlreadyExistError } from 'logic-qcm-plus';
import { HTTP_STATUS } from '../constants/httpStatus';

export class UserController {
  private readonly getUsersUseCase = new GetUsersUseCase();
  private userRepository = new UserPrismaRepository
  private createUserUseCase = new CreateUserUseCase(this.userRepository);

  public getUsers(req: Request, res: Response): void {
    const result = this.getUsersUseCase.execute();
    if (result.isOk()) {
      res.status(HTTP_STATUS.OK).json({ users: result.value });
    } else {
      res.status(HTTP_STATUS.NOT_FOUND).json({ error: result.error.message });
    }
  }

  public async createUser(req: Request, res: Response): Promise<void> {
    console.log('Requête reçue dans controlleur:', req.body);
    console.log('Utilisateur courant coté back:', req.user);
  
    const user = req.body;
    const curentUserRoleId = req.claims.roleId;
  //todo: supprimer nombre magique remplacer par http-status-codes

    if (!curentUserRoleId || curentUserRoleId !== 1) {
      res.status(HTTP_STATUS.FORBIDDEN).json({ error: 'Accès interdit : rôle ADMIN requis.' });
      return;
    }
  
    const requiredFields = [
      'login',
      'email',
      'password',
      'firstName',
      'lastName',
      'company',
    ];

    const result = await this.createUserUseCase.createUser(curentUserRoleId, user);
  
    if (result instanceof ValidationError || result instanceof AlreadyExistError) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ error: result.message });
    } else if (result.isOk()) {
      res.status(HTTP_STATUS.CREATED).json({ user: result.value });
    } else {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
  }
}
