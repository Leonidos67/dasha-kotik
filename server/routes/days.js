import { Router } from 'express';
import { Day } from '../models/Day.js';
import { Submission } from '../models/Submission.js';
import { authRequired } from '../middleware/auth.js';
import { config } from '../config.js';
import { getCurrentDayNumber } from '../utils/dayNumber.js';
import { ADMIN_ROLE, PLAYER_ROLE } from '../utils/roles.js';

const router = Router();

function giftStatusForDay(day, submissions) {
  const taskIds = day.tasks.map((t) => t._id.toString());
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

router.get('/meta', authRequired([PLAYER_ROLE, ADMIN_ROLE]), (_req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.json({
    currentDay: getCurrentDayNumber(),
    totalDays: 31,
    unlockAllDays: config.unlockAllDays,
    startDate: config.startDate,
    timezone: config.timezone,
  });
});

router.get('/:dayNumber', authRequired([PLAYER_ROLE, ADMIN_ROLE]), async (req, res) => {
  const dayNumber = Number(req.params.dayNumber);
  const day = await Day.findOne({ dayNumber }).lean();
  if (!day) return res.status(404).json({ error: 'День не найден' });

  const submissions = await Submission.find({ dayNumber }).lean();
  const tasks = day.tasks.map((task) => {
    const sub = submissions.find((s) => s.taskId.toString() === task._id.toString());
    return {
      ...task,
      submission: sub || null,
    };
  });

  const giftStatus = giftStatusForDay(day, submissions);

  res.json({
    ...day,
    tasks,
    giftStatus,
  });
});

router.get('/', authRequired([PLAYER_ROLE, ADMIN_ROLE]), async (req, res) => {
  const days = await Day.find().sort({ dayNumber: 1 }).lean();
  const submissions = await Submission.find().lean();

  const result = days.map((day) => ({
    dayNumber: day.dayNumber,
    date: day.date,
    isBonus: day.isBonus,
    isFinale: day.isFinale,
    title: day.title,
    taskCount: day.tasks.length,
    gift: day.gift,
    giftStatus: giftStatusForDay(day, submissions),
  }));

  res.json({ days: result, currentDay: getCurrentDayNumber() });
});

export default router;
