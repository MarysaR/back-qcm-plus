import { IncomingMessage, ServerResponse } from 'http';
import pino, { Logger } from 'pino';
import type { Level } from 'pino-http'; // ton stub
import pinoHttp from 'pino-http';

// On définit nos niveaux custom pour que TS infère Logger<Level>
const customLevels = {
  fatal: 60,
  error: 50,
  warn: 40,
  info: 30,
  debug: 20,
  trace: 10,
} as const;

export const logger: Logger<Level> = pino<Level>({
  level: 'trace',
  customLevels,
  useOnlyCustomLevels: true,
  transport: {
    target: 'pino-pretty',
  },
});

export const httpLogger = pinoHttp({
  logger,
  customLogLevel(
    req: IncomingMessage,
    res: ServerResponse,
    err?: Error
  ): Level {
    if (err) return 'error';
    if (res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  serializers: {
    req(
      req: IncomingMessage & { body?: unknown; query?: unknown }
    ): Record<string, unknown> {
      const filtered = { ...req.headers };
      [
        'user-agent',
        'accept',
        'accept-language',
        'accept-encoding',
        'dnt',
        'sec-gpc',
        'connection',
        'upgrade-insecure-requests',
        'sec-fetch-dest',
        'sec-fetch-mode',
        'sec-fetch-site',
        'sec-fetch-user',
        'if-none-match',
        'priority',
      ].forEach((h) => delete filtered[h]);

      return {
        method: req.method,
        url: req.url,
        headers: filtered,
        body: req.body,
        query: req.query,
        ip: req.socket?.remoteAddress,
        token: req.headers['authorization'] ?? null,
      };
    },
    res(res: ServerResponse): Record<string, unknown> {
      return { statusCode: res.statusCode };
    },
  },
});
