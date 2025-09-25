import jwt, { SignCallback, VerifyErrors, JwtPayload } from 'jsonwebtoken';
import { tokenConfig } from '../config/tokenConfig';
import {
  TokenProvider,
  TokenClaims,
  Result,
  Ok,
  Err,
  ValidationError,
  PermissionDeniedError,
  TechnicalError,
  AppError,
} from 'logic-qcm-plus';

export class JwtTokenProvider implements TokenProvider {
  async generate(payload: TokenClaims): Promise<Result<string, AppError>> {
    if (!tokenConfig.secret) {
      return Err.of(
        new TechnicalError('Clé secrète JWT manquante dans la configuration')
      );
    }

    return new Promise<Result<string, AppError>>((resolve) => {
      const callback: SignCallback = (err: Error | null, token?: string) => {
        if (err || !token) {
          return resolve(
            Err.of(new TechnicalError('Impossible de générer le token JWT'))
          );
        }
        return resolve(Ok.of(token));
      };

      jwt.sign(payload, tokenConfig.secret!, callback);
    });
  }

  async verify(token: string): Promise<Result<TokenClaims, AppError>> {
    if (!tokenConfig.secret) {
      return Err.of(
        new TechnicalError('Clé secrète JWT manquante dans la configuration')
      );
    }

    return new Promise<Result<TokenClaims, AppError>>((resolve) => {
      jwt.verify(
        token,
        tokenConfig.secret!,
        (err: VerifyErrors | null, decoded?: JwtPayload | string) => {
          if (err) {
            if (err.name == 'TokenExpiredError') {
              return resolve(
                Err.of(new PermissionDeniedError('Le token a expiré'))
              );
            }
            return resolve(Err.of(new ValidationError('Token invalide')));
          }

          return resolve(Ok.of(decoded as TokenClaims));
        }
      );
    });
  }
}
