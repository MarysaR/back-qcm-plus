import { Request, Response } from 'express';
import { GetUsersUseCase, CreateUserUseCase, RoleEnum } from 'logic-qcm-plus';
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



  // public async createUser(req: Request, res: Response): Promise<void> {

  //   console.log('Requête reçue dans controlleur:', req.body);
  //   console.log('Utilisateur courant coté back:', req.user);

  //   try {
  //     const user = req.body;
  //     const claims = req.claims;

  //     if (!claims || claims.roleId !== 1) {
  //       throw res.status(403).json({ error: 'Accès interdit : rôle ADMIN requis.' });
  //     }
      

  //     const requiredFields = [
  //       'login',
  //       'email',
  //       'password',
  //       'firstName',
  //       'lastName',
  //       'company',
  //     ];

  //     // Vérification des champs requis
  //     for (const field of requiredFields) {
  //       if (!user[field]) {
  //         throw new ValidationError(`Le champ ${field} est requis.`);
  //       }
  //     }

  //     // Validation de l'email
  //     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //     if (!emailRegex.test(user.email)) {
  //       throw new ValidationError('L\'email fourni n\'est pas valide.');
  //     }

  //     // Validation du mot de passe
  //     const passwordRegex =
  //       /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  //     if (!passwordRegex.test(user.password)) {
  //       throw new ValidationError(
  //         'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'
  //       );
  //     }



  //     // Appel de la méthode pour créer l'utilisateur
  //     const result = await this.createUserUseCase.createUser(currentUser, user);
  //     console.log('Résultat du use case :', result);
  //     res.status(201).json(result);
  //   } catch (error) {
  //     if (error instanceof ValidationError || error instanceof AlreadyExistError) {
  //       res.status(400).json({ error: error.message });
  //     } else {
  //       res.status(500).json({ error: 'Internal server error' });
  //     }
  //   }
  // }

  public async createUser(req: Request, res: Response): Promise<void> {
    console.log('Requête reçue dans controlleur:', req.body);
    console.log('Utilisateur courant coté back:', req.user);
  
    const user = req.body;
    const curentUserRoleId = req.claims.roleId;
  
    // Vérification des droits d'accès
    if (!curentUserRoleId || curentUserRoleId !== 1) {
      res.status(403).json({ error: 'Accès interdit : rôle ADMIN requis.' });
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
    const result = await this.createUserUseCase.createUser(RoleEnum.ADMIN, user);
  
    // Vérification du résultat
    if (result.success) {
      res.status(201).json(result);
    } else {
      if (result instanceof ValidationError || result instanceof AlreadyExistError) {
        res.status(400).json({ error: result.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}
