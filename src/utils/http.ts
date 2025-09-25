import { AppError } from 'logic-qcm-plus';
import { Response } from 'express';

export function sendSuccessResponse(
  res: Response,
  status: number,
  data: any
): void {
  res.status(status).json({ data });
}

export function sendErrorResponse(res: Response, error: AppError): void {
  const { code, message } = error.toHttpError();
  res.status(code).json({ code, error: message });
}
