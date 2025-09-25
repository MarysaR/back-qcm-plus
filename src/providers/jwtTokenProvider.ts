import jwt from 'jsonwebtoken';
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

    return new Promise((resolve, reject) => {
      jwt.sign(payload, tokenConfig.secret!, (err, token) => {
        if (err || !token) {
          reject(new TechnicalError('Impossible de générer le token JWT'));
        } else {
          return resolve(Ok.of(token));
        }
      });
    });
  }

  async verify(token: string): Promise<Result<TokenClaims, AppError>> {
    if (!tokenConfig.secret) {
      return Err.of(
        new TechnicalError('Clé secrète JWT manquante dans la configuration')
      );
    }

    return new Promise((resolve) => {
      jwt.verify(token, tokenConfig.secret!, (err, decoded) => {
        if (err) {
          if (err.name == 'TokenExpiredError') {
            return resolve(
              Err.of(new PermissionDeniedError('Le token a expiré'))
            );
          }
          return resolve(Err.of(new ValidationError('Token invalide')));
        }

        resolve(Ok.of(decoded as TokenClaims));
      });
    });
  }
}
