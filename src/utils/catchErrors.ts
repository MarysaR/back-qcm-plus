import { Request, Response, NextFunction } from 'express';
import { TechnicalError } from 'logic-qcm-plus';
import { logger } from '../config/logger';

/**
 * Décorateur qui catch les erreurs inattendues dans un contrôleur
 * et renvoie automatiquement une 500 avec log.
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

        const error = new TechnicalError('Erreur interne dans le contrôleur');
        const { code, message } = error.toHttpError();

        return res.status(code).json({ code, error: message });
      }
    };

    return descriptor;
  };
}
