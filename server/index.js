import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { corsOrigin } from './utils/cors.js';
import authRoutes from './routes/auth.js';
import daysRoutes from './routes/days.js';
import submissionsRoutes from './routes/submissions.js';
import adminRoutes from './routes/admin.js';
import coinsRoutes from './routes/coins.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.set('trust proxy', 1);

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Type'],
  })
);
app.use(cookieParser());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, config.uploadDir)));

app.use('/api/auth', authRoutes);
app.use('/api/days', daysRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/coins', coinsRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/', (_req, res) => res.json({ ok: true, service: 'dasha-moscow-api' }));

if (config.serveClient) {
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'), (err) => {
      if (err) res.status(404).send('Client not built. Run npm run build in client.');
    });
  });
}

mongoose
  .connect(config.mongoUri, { serverSelectionTimeoutMS: 10000 })
  .then(() => {
    app.listen(config.port, '0.0.0.0', () => {
      console.log(`Server listening on port ${config.port}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
