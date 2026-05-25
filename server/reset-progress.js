import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { config } from './config.js';
import { Submission } from './models/Submission.js';
import { Wallet } from './models/Wallet.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, config.uploadDir);

/** dasha | test | all — по умолчанию только Даша (чистый старт для подарка) */
const target = (process.argv[2] || 'dasha').toLowerCase();

function clearUploads() {
  if (!fs.existsSync(uploadsDir)) return 0;
  let removed = 0;
  for (const name of fs.readdirSync(uploadsDir)) {
    if (name === '.gitkeep') continue;
    fs.unlinkSync(path.join(uploadsDir, name));
    removed += 1;
  }
  return removed;
}

async function reset() {
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10000 });

  const userFilter =
    target === 'all' ? {} : target === 'test' ? { userId: 'test' } : { userId: 'dasha' };

  const legacyFilter =
    target === 'dasha'
      ? { $or: [{ userId: 'dasha' }, { userId: { $exists: false } }] }
      : userFilter;

  const { deletedCount } = await Submission.deleteMany(
    target === 'dasha' ? legacyFilter : userFilter
  );

  if (target === 'all') {
    await Wallet.deleteMany({});
  } else if (target === 'test') {
    await Wallet.deleteMany({ userId: 'test' });
  } else {
    await Wallet.deleteMany({ userId: { $in: ['dasha', 'dashenka'] } });
  }

  const filesRemoved = target === 'dasha' || target === 'all' ? clearUploads() : 0;

  console.log(`Сброс для: ${target}`);
  console.log(`Удалено отчётов: ${deletedCount}`);
  console.log(`Сброшен кошелёк`);
  if (filesRemoved) console.log(`Удалено файлов в uploads/: ${filesRemoved}`);

  await mongoose.disconnect();
}

reset().catch((err) => {
  console.error(err);
  process.exit(1);
});
