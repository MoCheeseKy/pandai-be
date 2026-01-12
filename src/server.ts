import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { pino } from 'pino';

import errorHandler from './common/middleware/errorHandler';
import rateLimiter from './common/middleware/rateLimiter';
import requestLogger from './common/middleware/requestLogger';
import { env } from './common/utils/envConfig';
import routes from './routes/v1';
import docsRouter from './routes/docs';

const logger = pino({ name: 'server start' });
const app: Express = express();

app.set('trust proxy', true);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'script-src': [
          "'self'",
          "'unsafe-inline'",
          'cdnjs.cloudflare.com',
          'vercel.live',
        ],
        'img-src': ["'self'", 'data:', 'blob:', 'validator.swagger.io'],
        'style-src': [
          "'self'",
          "'unsafe-inline'",
          'cdnjs.cloudflare.com',
          'fonts.googleapis.com',
        ],
        'connect-src': ["'self'", 'vercel.live'],
      },
    },
    crossOriginResourcePolicy: false,
  })
);

app.use(rateLimiter);
app.use(requestLogger);

// Routes
app.use(routes); // Router V1 Aplikasi
app.use(docsRouter); // Router Swagger Docs

// Error handlers
app.use(errorHandler());

export { app, logger };
