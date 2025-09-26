/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from 'express';
import {
  AuthenticateUserUseCase,
  GetCurrentUserUseCase,
  UserRepository,
  PasswordHasher,
  TokenProvider,
  ValidationError,
  Result,
  AppError,
  Err,
  Ok,
  LogoutUserUseCase,
} from 'logic-qcm-plus';
import { CatchErrors } from '../../utils/catchErrors';
import { HandleResult } from '../../utils/handleResult';
import { UserPrismaRepository } from '../../repositories/user-prisma-repository';
import { BcryptPasswordHasher } from '../../providers/bcryptPasswordHasher';
import { JwtTokenProvider } from '../../providers/jwtTokenProvider';

export class AuthController {
  @CatchErrors()
  @HandleResult()
  async login(
    req: Request,
    _res: Response
  ): Promise<Result<{ token: string }, AppError>> {
    const { email, password } = req.body;
    if (!email || email.trim() == '') {
      return Err.of(new ValidationError("L'email est obligatoire"));
    }

    if (!password || password.trim() == '') {
      return Err.of(new ValidationError('Le mot de passe est obligatoire'));
    }

    const userRepository: UserRepository = new UserPrismaRepository();
    const passwordHasher: PasswordHasher = new BcryptPasswordHasher();
    const tokenProvider: TokenProvider = new JwtTokenProvider();

    const authenticateUserUseCase = new AuthenticateUserUseCase(
      userRepository,
      tokenProvider,
      passwordHasher
    );

    const result = await authenticateUserUseCase.execute({ email, password });
    if (result.isErr()) {
      return Err.of(result.error);
    }

    return Ok.of({ token: result.value });
  }

  @CatchErrors()
  @HandleResult()
  async me(req: Request, _res: Response): Promise<Result<unknown, AppError>> {
    if (!req.claims) {
      return Err.of(new ValidationError('Token JWT manquant ou invalide'));
    }

    const userRepository: UserRepository = new UserPrismaRepository();
    const getCurrentUserUseCase = new GetCurrentUserUseCase(userRepository);

    const result = await getCurrentUserUseCase.execute(req.claims);

    if (result.isOk()) {
      const { password, ...safeUser } = result.value;
      return Ok.of(safeUser);
    }

    return result;
  }

  @CatchErrors()
  @HandleResult()
  async logout(
    req: Request,
    _res: Response
  ): Promise<Result<{ message: string }, AppError>> {
    const { token } = req.body;

    const logoutUserUseCase = new LogoutUserUseCase();

    const result = await logoutUserUseCase.execute(token);
    if (result.isOk()) {
      return Ok.of({ message: 'Déconnecté avec succès' });
    }

    return Err.of(result.error);
  }
}
