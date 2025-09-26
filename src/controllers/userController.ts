import { Request, Response } from 'express';
import { GetUsersUseCase, CreateUserUseCase } from 'logic-qcm-plus';
import { UserPrismaRepository } from '../repositories/user-prisma-repository';
import { ValidationError, AlreadyExistError } from 'logic-qcm-plus';

export class UserController {
  private readonly getUsersUseCase = new GetUsersUseCase();
  private userRepository = new UserPrismaRepository
  private createUserUseCase = new CreateUserUseCase(this.userRepository);

  public getUsers(req: Request, res: Response): void {
    const result = this.getUsersUseCase.execute();
    if (result.isOk()) {
      res.status(200).json({ users: result.value });
    } else {
      res.status(404).json({ error: result.error.message });
    }
  }

  public async createUser(req: Request, res: Response): Promise<void> {
    try {
      const user = req.body;

      // Champs requis
      const requiredFields = [
        'login',
        'email',
        'password',
        'firstName',
        'lastName',
        'company',
      ];

      // Vérification des champs requis
      for (const field of requiredFields) {
        if (!user[field]) {
          throw new ValidationError(`Le champ ${field} est requis.`);
        }
      }

      // Validation de l'email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(user.email)) {
        throw new ValidationError('L\'email fourni n\'est pas valide.');
      }

      // Validation du mot de passe
      const passwordRegex =
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(user.password)) {
        throw new ValidationError(
          'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'
        );
      }

      // Appel de la méthode pour créer l'utilisateur
      const result = await this.createUserUseCase.createUser(user);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof ValidationError || error instanceof AlreadyExistError) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}
