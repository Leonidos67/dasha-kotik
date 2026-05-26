import { Router } from 'express';
import { Day } from '../models/Day.js';
import { Submission } from '../models/Submission.js';
import { authRequired } from '../middleware/auth.js';
import { config } from '../config.js';
import { COIN_DAY5_REDEEM } from '../utils/coins.js';
import { getCurrentDayNumber } from '../utils/dayNumber.js';
import { visibleTasks } from '../utils/tasks.js';
import {
  ADMIN_ROLE,
  getUserIdForRole,
  PLAYER_ROLES,
  normalizeRole,
} from '../utils/roles.js';

const router = Router();

function giftStatusForDay(day, submissions) {
  const taskIds = visibleTasks(day.tasks).map((t) => t._id.toString());
  if (taskIds.length === 0) {
    return { allSubmitted: true, allApproved: true, unlocked: true };
  }
  const daySubs = submissions.filter((s) => s.dayNumber === day.dayNumber);
  const allSubmitted = taskIds.every((id) =>
    daySubs.some((s) => s.taskId.toString() === id)
  );
  const allApproved =
    allSubmitted &&
    taskIds.every((id) =>
      daySubs.some((s) => s.taskId.toString() === id && s.status === 'approved')
    );
  return { allSubmitted, allApproved, unlocked: allApproved };
}

function resolveUserId(req) {
  const role = normalizeRole(req.user.role);
  if (role === ADMIN_ROLE) return getUserIdForRole('dasha');
  return getUserIdForRole(role);
}

function giftForClient(day, isAdmin) {
  if (isAdmin || day.dayNumber !== COIN_DAY5_REDEEM) return day.gift;
  return null;
}

router.get('/meta', authRequired([...PLAYER_ROLES, ADMIN_ROLE]), (_req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.json({
    currentDay: getCurrentDayNumber(),
    totalDays: 31,
    unlockAllDays: config.unlockAllDays,
    startDate: config.startDate,
    timezone: config.timezone,
  });
});

router.get('/:dayNumber', authRequired([...PLAYER_ROLES, ADMIN_ROLE]), async (req, res) => {
  const dayNumber = Number(req.params.dayNumber);
  const isAdmin = normalizeRole(req.user.role) === ADMIN_ROLE;
  const userId = resolveUserId(req);
  const day = await Day.findOne({ dayNumber }).lean();
  if (!day) return res.status(404).json({ error: 'День не найден' });

  const submissions = await Submission.find({ userId, dayNumber }).lean();
  const dayTasks = isAdmin ? day.tasks : visibleTasks(day.tasks);
  const tasks = dayTasks.map((task) => {
    const sub = submissions.find((s) => s.taskId.toString() === task._id.toString());
    return {
      ...task,
      submission: sub || null,
    };
  });

  const giftStatus = giftStatusForDay(day, submissions);

  res.json({
    ...day,
    gift: giftForClient(day, isAdmin),
    tasks,
    giftStatus,
  });
});

router.get('/', authRequired([...PLAYER_ROLES, ADMIN_ROLE]), async (req, res) => {
  const isAdmin = normalizeRole(req.user.role) === ADMIN_ROLE;
  const userId = resolveUserId(req);
  const days = await Day.find().sort({ dayNumber: 1 }).lean();
  const submissions = await Submission.find({ userId }).lean();

  const result = days.map((day) => ({
    dayNumber: day.dayNumber,
    date: day.date,
    isBonus: day.isBonus,
    isFinale: day.isFinale,
    title: day.title,
    taskCount: visibleTasks(day.tasks).length,
    gift: giftForClient(day, isAdmin),
    giftStatus: giftStatusForDay(day, submissions),
  }));

  res.json({ days: result, currentDay: getCurrentDayNumber() });
});

export default router;
