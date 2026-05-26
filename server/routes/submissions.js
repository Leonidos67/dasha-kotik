import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Day } from '../models/Day.js';
import { Submission } from '../models/Submission.js';
import { authRequired } from '../middleware/auth.js';
import { config } from '../config.js';
import { publicUploadUrl } from '../utils/uploadUrl.js';
import { getCurrentDayNumber } from '../utils/dayNumber.js';
import { getCoinState, getWallet } from '../utils/coins.js';
import { buildGiftsList } from '../utils/gifts.js';
import { visibleTasks } from '../utils/tasks.js';
import {
  ADMIN_ROLE,
  getUserIdForRole,
  PLAYER_ROLES,
  normalizeRole,
} from '../utils/roles.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadPath = path.join(__dirname, '..', config.uploadDir);

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadPath),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

const router = Router();

function actorRole(req) {
  return normalizeRole(req.user.role);
}

router.post(
  '/',
  authRequired(PLAYER_ROLES),
  upload.array('files', 10),
  async (req, res) => {
    const { dayNumber, taskId, text } = req.body;
    const dn = Number(dayNumber);
    const role = actorRole(req);
    const userId = getUserIdForRole(role);

    const day = await Day.findOne({ dayNumber: dn });
    if (!day) return res.status(404).json({ error: 'День не найден' });

    const task = day.tasks.id(taskId);
    if (!task) return res.status(404).json({ error: 'Задание не найдено' });
    if (task.hidden) return res.status(400).json({ error: 'Это задание скрыто' });

    const current = getCurrentDayNumber();
    if (dn > current) {
      return res.status(400).json({ error: 'Этот день ещё не наступил' });
    }

    if (task.submissionType === 'text' && !text?.trim()) {
      return res.status(400).json({ error: 'Нужен текст' });
    }

    const needsFile = ['photo', 'voice', 'workout', 'video'].includes(task.submissionType);
    if (needsFile && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ error: 'Нужно прикрепить файл' });
    }

    const files = (req.files || []).map((f) => ({
      filename: f.filename,
      originalName: f.originalname,
      mimeType: f.mimetype,
      url: publicUploadUrl(`/uploads/${f.filename}`),
    }));

    const submission = await Submission.findOneAndUpdate(
      { userId, dayNumber: dn, taskId },
      {
        userId,
        dayNumber: dn,
        taskId,
        text: text || '',
        files,
        status: 'pending',
        giftSeen: false,
      },
      { upsert: true, new: true }
    );

    res.json(submission);
  }
);

router.patch('/:id/approve', authRequired([ADMIN_ROLE]), async (req, res) => {
  const { status } = req.body;
  const allowed = ['approved', 'rejected', 'pending'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Неверный статус' });
  }

  const submission = await Submission.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );
  if (!submission) return res.status(404).json({ error: 'Не найдено' });
  res.json(submission);
});

router.post('/gifts/:dayNumber/seen', authRequired(PLAYER_ROLES), async (req, res) => {
  const dayNumber = Number(req.params.dayNumber);
  const role = actorRole(req);
  const userId = getUserIdForRole(role);
  const wallet = await getWallet(role);

  if (dayNumber === 5 && wallet.day5CoinGiftClaimed) {
    wallet.day5CoinGiftSeen = true;
    await wallet.save();
  }
  await Submission.updateMany({ userId, dayNumber }, { giftSeen: true });
  res.json({ ok: true });
});

router.get('/gifts', authRequired([...PLAYER_ROLES, ADMIN_ROLE]), async (req, res) => {
  const role = req.user.role === ADMIN_ROLE ? 'dasha' : actorRole(req);
  const { gifts } = await buildGiftsList(role);
  const coins = await getCoinState(role);
  res.json({
    gifts,
    coinShop: coins.day5CoinGift,
    coinsBalance: coins.balance,
  });
});

router.get('/admin/all', authRequired([ADMIN_ROLE]), async (_req, res) => {
  const submissions = await Submission.find().sort({ createdAt: -1 }).lean();
  const days = await Day.find().lean();
  const dayMap = Object.fromEntries(days.map((d) => [d.dayNumber, d]));

  const enriched = submissions.map((s) => {
    const day = dayMap[s.dayNumber];
    const task = day?.tasks.find((t) => t._id.toString() === s.taskId.toString());
    return {
      ...s,
      taskTitle: task?.title,
      taskType: task?.submissionType,
      userLabel: s.userId === 'test' ? 'тест' : 'Даша',
    };
  });

  res.json({ submissions: enriched });
});

export default router;
