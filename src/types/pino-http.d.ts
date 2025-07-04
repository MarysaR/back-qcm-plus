declare module 'pino-http' {
  import { IncomingMessage, ServerResponse } from 'http';
  import type { Logger } from 'pino';

  /** Niveaux de log supportés */
  export type Level = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

  /** Options pour configurer le middleware HTTP logger */
  export interface HttpLoggerOptions {
    /** Logger Pino existant */
    logger: Logger<Level>;
    /** Détermine dynamiquement le niveau de log pour chaque requête */
    customLogLevel?: (
      req: IncomingMessage,
      res: ServerResponse,
      err?: Error
    ) => Level;
    /** Sérialise la requête et/ou la réponse */
    serializers?: {
      req?: (
        req: IncomingMessage & Record<string, unknown>
      ) => Record<string, unknown>;
      res?: (res: ServerResponse) => Record<string, unknown>;
    };
  }

  /** Interface renvoyée par pinoHttp */
  export interface HttpLogger {
    /** Méthode d'appel du middleware */
    (opts?: HttpLoggerOptions): unknown;
  }

  /** Fonction principale du module */
  export default function pinoHttp(opts?: HttpLoggerOptions): HttpLogger;
}

// Stubs vides pour modules sans types
declare module 'pino-pretty';
declare module 'pino-std-serializers';
