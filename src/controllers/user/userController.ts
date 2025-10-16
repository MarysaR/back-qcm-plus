/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from 'express';
import {
  AppError,
  CreateUserCommand,
  CreateUserUseCase,
  GetAllUsersUseCase,
  Err,
  Ok,
  PermissionDeniedError,
  Result,
  User,
  ValidationError,
} from 'logic-qcm-plus';
import { CatchErrors } from '../../utils/catchErrors';
import { HandleResult } from '../../utils/handleResult';
import { claimsToUser } from '../../utils/claimsToUser';
import { UserPrismaRepository } from '../../repositories/user-prisma-repository';
import { BcryptPasswordHasher } from '../../providers/bcryptPasswordHasher';

export class UserController {
  @CatchErrors()
  @HandleResult()
  async createUser(
    req: Request,
    res: Response
  ): Promise<Result<void, AppError>> {
    const newUser = req.body;
    const currentUser = claimsToUser(req.claims);

    if (!currentUser) {
      return Err.of(new PermissionDeniedError('Utilisateur non authentifié'));
    }

    if (!newUser) {
      return Err.of(new ValidationError('Données utilisateur invalides'));
    }

    const createUserUseCase = new CreateUserUseCase(
      new UserPrismaRepository(),
      new BcryptPasswordHasher()
    );

    const command: CreateUserCommand = {
      currentUser: currentUser.id,
      newUser,
    };

    const result = await createUserUseCase.execute(command);
    if (result.isErr()) {
      return Err.of(result.error);
    }

    return Ok.of(undefined);
  }


  @CatchErrors()
  @HandleResult()
  async getAllUsers(
    req: Request,
    _res: Response
  ): Promise<Result<User[], AppError>> {
    const currentUser = claimsToUser(req.claims);

    if (!currentUser) {
      return Err.of(new PermissionDeniedError('Utilisateur non authentifié'));
    }

    const userRepository = new UserPrismaRepository();
    const getAllUsersUseCase = new GetAllUsersUseCase(userRepository);

    const result = await getAllUsersUseCase.execute(currentUser);

    if (result.isErr()) {
      return Err.of(result.error);
    }

    return Ok.of(result.value);
  }

  
}
