import { IncomingMessage, ServerResponse } from 'http';
import pino from 'pino';
import pinoHttp, { Options } from 'pino-http';

export const logger = pino({
  level: 'trace',
  transport: {
    target: 'pino-pretty',
  },
});

export const httpLogger = pinoHttp({
  logger,
  customLogLevel(req, res, err) {
    if (err) return 'error';
    if (res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  serializers: {
    req(req: IncomingMessage & { body?: unknown; query?: unknown }) {
      const filteredHeaders = { ...req.headers };

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
      ].forEach((header) => delete filteredHeaders[header]);

      return {
        method: req.method,
        url: req.url,
        headers: filteredHeaders,
        body: req.body,
        query: req.query,
        ip: req.socket?.remoteAddress,
        token: req.headers['authorization'] || null,
      };
    },
    res(res: ServerResponse) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
} as Options<
  IncomingMessage & { body?: unknown; query?: unknown },
  ServerResponse
>);
