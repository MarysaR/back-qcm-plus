import { IncomingMessage } from 'http';
import pino from 'pino';
import pinoHttp from 'pino-http';

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
    req(req) {
      const expressReq = req as IncomingMessage & {
        body?: unknown;
        query?: unknown;
      };

      const filteredHeaders = { ...req.headers };

      delete filteredHeaders['user-agent'];
      delete filteredHeaders['accept'];
      delete filteredHeaders['accept-language'];
      delete filteredHeaders['accept-encoding'];
      delete filteredHeaders['dnt'];
      delete filteredHeaders['sec-gpc'];
      delete filteredHeaders['connection'];
      delete filteredHeaders['upgrade-insecure-requests'];
      delete filteredHeaders['sec-fetch-dest'];
      delete filteredHeaders['sec-fetch-mode'];
      delete filteredHeaders['sec-fetch-site'];
      delete filteredHeaders['sec-fetch-user'];
      delete filteredHeaders['if-none-match'];
      delete filteredHeaders['priority'];

      return {
        method: req.method,
        url: req.url,
        headers: filteredHeaders,
        body: expressReq.body,
        query: expressReq.query,
        ip: req.socket?.remoteAddress,
        token: req.headers['authorization'] || null,
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
});
