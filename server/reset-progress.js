import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { config } from './config.js';
import { Submission } from './models/Submission.js';
import { Wallet } from './models/Wallet.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, config.uploadDir);

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

  const { deletedCount } = await Submission.deleteMany({});
  await Wallet.deleteMany({});
  const filesRemoved = clearUploads();

  console.log(`Удалено отчётов: ${deletedCount}`);
  console.log(`Сброшен кошелёк монеток`);
  console.log(`Удалено файлов в uploads/: ${filesRemoved}`);
  console.log('Задания и подарки в базе не трогались.');

  await mongoose.disconnect();
}

reset().catch((err) => {
  console.error(err);
  process.exit(1);
});
