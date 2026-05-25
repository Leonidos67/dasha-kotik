import dotenv from 'dotenv';

dotenv.config();

const defaultClient = 'http://localhost:5173';

export const config = {
  port: Number(process.env.PORT) || 3001,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dasha-moscow',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  adminPassword: process.env.ADMIN_PASSWORD || 'lenya-admin',
  dashaPassword: process.env.DASHA_PASSWORD || 'dasha-zay',
  /** Один URL или несколько через запятую (Vercel preview + production) */
  clientUrls: (process.env.CLIENT_URL || defaultClient)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  clientUrl: (process.env.CLIENT_URL || defaultClient).split(',')[0].trim(),
  apiPublicUrl: (process.env.API_PUBLIC_URL || '').replace(/\/$/, ''),
  startDate: process.env.START_DATE || '2026-05-25',
  /** По какому поясу открываются дни (Даша в Москве) */
  timezone: process.env.APP_TIMEZONE || 'Europe/Moscow',
  uploadDir: 'uploads',
  isProduction: process.env.NODE_ENV === 'production',
  serveClient: process.env.SERVE_CLIENT === 'true',
  unlockAllDays: ['true', '1', 'yes'].includes(
    (process.env.UNLOCK_ALL_DAYS || '').toLowerCase()
  ),
};