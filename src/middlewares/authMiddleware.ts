import { Request, Response, NextFunction } from 'express';
import {
  VerifyTokenUseCase,
  TokenProvider,
  ValidationError,
  PermissionDeniedError,
} from 'logic-qcm-plus';
import { JwtTokenProvider } from '../providers/jwtTokenProvider';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error = new ValidationError(
      'En-tête Authorization manquant ou incorrect'
    );
    const { code, message } = error.toHttpError();
    res.status(code).json({ code, error: message });
    return;
  }

  const token = authHeader.substring(7);
  const tokenProvider: TokenProvider = new JwtTokenProvider();
  const verifyTokenUseCase = new VerifyTokenUseCase(tokenProvider);

  const result = await verifyTokenUseCase.execute(token);
  if (result.isErr()) {
    const error = new PermissionDeniedError(
      'Le token fourni est invalide ou a expiré'
    );
    const { code, message } = error.toHttpError();
    res.status(code).json({ code, error: message });
    return;
  }

  req.claims = result.value;

  next();
};
