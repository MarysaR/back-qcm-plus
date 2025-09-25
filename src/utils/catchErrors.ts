import { Request, Response, NextFunction } from 'express';
import { sendErrorResponse } from './httpResponse';
import { TechnicalError } from 'logic-qcm-plus';
import { logger } from '../config/logger';

/**
 * Permet de catch les erreurs de façon automatique sur la route possédant le décorateur
 * La requête renverra automatiquement une erreur 500 et log l'erreur
 */
export function CatchErrors(): MethodDecorator {
  return function (
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>
  ) {
    const previousDescriptor = descriptor.value;
    descriptor.value = async function (
      req: Request,
      res: Response,
      next: NextFunction
    ) {
      try {
        await previousDescriptor.apply(this, [req, res, next]);
      } catch (e) {
        logger.error(e);
        sendErrorResponse(
          res,
          new TechnicalError('Erreur dans le controlleur')
        );
      }
    };

    return descriptor;
  };
}
