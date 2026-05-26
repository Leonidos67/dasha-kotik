import { Router } from 'express';
import { Day } from '../models/Day.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/days', authRequired(['admin']), async (_req, res) => {
  const days = await Day.find().sort({ dayNumber: 1 }).lean();
  res.json({ days });
});

router.patch('/days/:dayNumber/gift', authRequired(['admin']), async (req, res) => {
  const dayNumber = Number(req.params.dayNumber);
  const { title, description } = req.body;

  const day = await Day.findOneAndUpdate(
    { dayNumber },
    {
      $set: {
        'gift.title': title,
        'gift.description': description,
      },
    },
    { new: true }
  );

  if (!day) return res.status(404).json({ error: 'День не найден' });
  res.json({ gift: day.gift });
});

router.post('/days/:dayNumber/tasks', authRequired(['admin']), async (req, res) => {
  const dayNumber = Number(req.params.dayNumber);
  const { title, description, submissionType, hidden } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ error: 'Укажи название задания' });
  }
  if (!submissionType) {
    return res.status(400).json({ error: 'Укажи тип отчёта' });
  }

  const day = await Day.findOne({ dayNumber });
  if (!day) return res.status(404).json({ error: 'День не найден' });

  const order = day.tasks.length
    ? Math.max(...day.tasks.map((t) => t.order ?? 0)) + 1
    : 0;

  day.tasks.push({
    title: title.trim(),
    description: description?.trim() || '',
    submissionType,
    order,
    hidden: !!hidden,
  });

  await day.save();
  const task = day.tasks[day.tasks.length - 1];
  res.status(201).json({ task });
});

router.patch('/days/:dayNumber/tasks/:taskId', authRequired(['admin']), async (req, res) => {
  const dayNumber = Number(req.params.dayNumber);
  const { taskId } = req.params;
  const { title, description, submissionType, hidden } = req.body;

  const day = await Day.findOne({ dayNumber });
  if (!day) return res.status(404).json({ error: 'День не найден' });

  const task = day.tasks.id(taskId);
  if (!task) return res.status(404).json({ error: 'Задание не найдено' });

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (submissionType !== undefined) task.submissionType = submissionType;
  if (hidden !== undefined) task.hidden = hidden;

  await day.save();
  res.json({ task });
});

export default router;
