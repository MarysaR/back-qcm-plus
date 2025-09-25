import express, { Application } from 'express';
import cors from 'cors';
import { httpLogger, logger } from './config/logger';
import routes from './routes';
import prisma from './config/prisma';

const app: Application = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use(httpLogger);

app.use(routes);
app.listen(port, async () => {
  try {
    await prisma.$connect();
    logger.info('Connected to database');
  } catch (err: unknown) {
    logger.error({ err }, 'Failed to connect to database');
    process.exit(1);
  }

  logger.info(`Server is running on port ${port}`);
});

export default app;
