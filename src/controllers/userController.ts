import { Request, Response } from 'express';
import { GetUsersUseCase } from 'logic-qcm-plus';

export class UserController {
  private readonly getUsersUseCase = new GetUsersUseCase();

  public getUsers(req: Request, res: Response): void {
    const result = this.getUsersUseCase.execute();
    if (result.isOk()) {
      res.status(200).json({ users: result.value });
    } else {
      res.status(404).json({ error: result.error.message });
    }
  }
}
