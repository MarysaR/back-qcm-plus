import express from 'express';
import cors from 'cors';
import { httpLogger, logger } from './config/logger';
import routes from './routes';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(httpLogger);
app.use(routes);

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
