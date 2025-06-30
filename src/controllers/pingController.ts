import { Request, Response } from 'express';
import { PingUseCase } from 'logic-qcm-plus';

export class PingController {
  private readonly pingUseCase = new PingUseCase();

  public getPing(req: Request, res: Response): void {
    const result = this.pingUseCase.execute();
    if (result.isOk()) {
      res.status(200).json({ message: result.value });
    } else {
      res.status(500).json({ error: 'Unexpected error' });
    }
  }
}
