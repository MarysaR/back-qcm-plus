import { Response } from 'express';
import { AppError } from 'logic-qcm-plus';

export function sendErrorResponse(res: Response, error: AppError) {
  const { code, message } = error.toHttpError();

  return res.status(code).send({
    error: message,
    statusCode: code,
    type: error.constructor.name,
    timestamp: new Date().getTime(),
  });
}

export function sendSuccessResponse<T extends object>(
  res: Response,
  statusCode: number,
  data: T = {} as T
) {
  return res.status(statusCode).send({
    success: 'Opération réussie',
    statusCode,
    data,
    timestamp: new Date().getTime(),
  });
}
