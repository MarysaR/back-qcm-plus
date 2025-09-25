import { TokenClaims, User } from 'logic-qcm-plus';

/**
 * Extension personnalisée de l'interface `Request` d'Express
 * pour inclure les propriétés d'authentification utilisateur.
 */
declare module 'express-serve-static-core' {
  interface Request {
    claims: TokenClaims;
    userEmail?: string;
    user?: User;
  }
}
