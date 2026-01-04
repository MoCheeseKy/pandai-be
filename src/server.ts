import cors, { CorsOptions } from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { pino } from 'pino';

import errorHandler from './common/middleware/errorHandler';
import rateLimiter from './common/middleware/rateLimiter';
import requestLogger from './common/middleware/requestLogger';
import indexRouter from './routes/index';
import docsRouter from './routes/docs';
import path from 'path';

const logger = pino({ name: 'server start' });
const app: Express = express();

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://jernih-us.vercel.app',
];

const corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('This origin is not allowed'));
    }
  },

  credentials: true,

  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',

  allowedHeaders: 'Content-Type, Authorization',

  optionsSuccessStatus: 204,
};

// Set the application to trust the reverse proxy
app.set('trust proxy', true);

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/../public')));
app.use(helmet());
app.use(rateLimiter);

// Request logging
app.use(requestLogger);

// Routes
// app.use('/health-check', healthCheckRouter);
// app.use('/users', userRouter);
// app.use('/auth', authRouter);
app.use(indexRouter);
app.use(docsRouter);

// Error handlers
app.use(errorHandler());

export { app, logger };
