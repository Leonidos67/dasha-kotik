import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 3001,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dasha-moscow',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  adminPassword: process.env.ADMIN_PASSWORD || 'lenya-admin',
  dashaPassword: process.env.DASHA_PASSWORD || 'dasha-zay',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  startDate: process.env.START_DATE || '2026-05-25',
  uploadDir: 'uploads',
  /** Временно: открыть все 31 дня. Поставь UNLOCK_ALL_DAYS=true в .env */
  unlockAllDays: process.env.UNLOCK_ALL_DAYS === 'true',
};
