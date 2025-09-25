declare module 'pino-http' {
  import { IncomingMessage, ServerResponse } from 'http';
  import type { Logger } from 'pino';

  export type Level = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

  export interface HttpLoggerOptions {
    logger: Logger<Level>;

    customLogLevel?: (
      req: IncomingMessage,
      res: ServerResponse,
      err?: Error
    ) => Level;

    serializers?: {
      req?: (
        req: IncomingMessage & Record<string, unknown>
      ) => Record<string, unknown>;
      res?: (res: ServerResponse) => Record<string, unknown>;
    };
  }

  export interface HttpLogger {
    (opts?: HttpLoggerOptions): unknown;
  }

  export default function pinoHttp(opts?: HttpLoggerOptions): HttpLogger;
}

declare module 'pino-pretty';
declare module 'pino-std-serializers';
