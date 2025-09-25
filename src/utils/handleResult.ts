import { Request, Response, NextFunction } from 'express';
import { Result, AppError } from 'logic-qcm-plus';

/**
 * Décorateur qui transforme un `Result<T, AppError>` en réponse HTTP.
 * - Si `successStatus` est fourni → il est utilisé.
 * - Sinon → le code est choisi automatiquement selon la méthode HTTP :
 *   - GET → 200 OK
 *   - POST → 201 Created
 *   - PUT / PATCH → 200 OK
 *   - DELETE → 204 No Content
 *
 * @param {number} [successStatus] Code HTTP en cas de succès
 * @returns {MethodDecorator} Décorateur de méthode pour contrôleur Express
 */
export function HandleResult(successStatus?: number): MethodDecorator {
  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>
  ) => {
    const handler = descriptor.value;

    descriptor.value = async function (
      req: Request,
      res: Response,
      next: NextFunction
    ) {
      const result: Result<any, AppError> = await handler.apply(this, [
        req,
        res,
        next,
      ]);

      if (!result) return;

      if (result.isErr()) {
        const { code, message } = result.error.toHttpError();
        return res.status(code).json({ code, error: message });
      }

      let status = successStatus;
      if (!status) {
        switch (req.method) {
          case 'POST':
            status = 201;
            break;
          case 'DELETE':
            status = 204;
            break;
          case 'PUT':
          case 'PATCH':
            status = 200;
            break;
          default:
            status = 200;
        }
      }

      return res.status(status).json(result.value);
    };

    return descriptor;
  };
}
