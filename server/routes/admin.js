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

router.patch('/days/:dayNumber/tasks/:taskId', authRequired(['admin']), async (req, res) => {
  const dayNumber = Number(req.params.dayNumber);
  const { taskId } = req.params;
  const { title, description, submissionType } = req.body;

  const day = await Day.findOne({ dayNumber });
  if (!day) return res.status(404).json({ error: 'День не найден' });

  const task = day.tasks.id(taskId);
  if (!task) return res.status(404).json({ error: 'Задание не найдено' });

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (submissionType !== undefined) task.submissionType = submissionType;

  await day.save();
  res.json({ task });
});

export default router;
