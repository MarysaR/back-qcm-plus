import express, { Application } from 'express';
import cors from 'cors';
import { logger } from './config/logger';
import routes from './routes';
import prisma from './config/prisma';

const app: Application = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use(routes);

app.listen(port, async () => {
  try {
    await prisma.$connect();
    logger.info('Connected to database');
  } catch (err) {
    logger.error('Failed to connect to database', err);
    process.exit(1);
  }
  logger.info(`Server is running on port ${port}`);
});

export default app;
