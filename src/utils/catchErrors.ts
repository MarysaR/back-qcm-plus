import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { TechnicalError } from 'logic-qcm-plus';
import { sendErrorResponse } from './httpResponse';

/**
 * Décorateur pour catcher automatiquement les erreurs des routes.
 * Renvoie une 500 + log en cas d'exception.
 */
export function CatchErrors(): MethodDecorator {
  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor => {
    const originalMethod = descriptor.value as (
      req: Request,
      res: Response,
      next: NextFunction
    ) => Promise<unknown>;

    descriptor.value = async function (
      req: Request,
      res: Response,
      next: NextFunction
    ) {
      try {
        await originalMethod.apply(this, [req, res, next]);
      } catch (e) {
        logger.error(e);
        sendErrorResponse(res, new TechnicalError('Erreur dans le contrôleur'));
      }
    };

    return descriptor;
  };
}
