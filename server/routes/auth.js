import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { signToken } from '../middleware/auth.js';

const router = Router();

router.post('/dasha', (req, res) => {
  const { password } = req.body;
  if (password !== config.dashaPassword) {
    return res.status(401).json({ error: 'Неверный пароль' });
  }
  const token = signToken('dasha');
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  res.json({ ok: true, role: 'dasha' });
});

router.post('/admin', (req, res) => {
  const { password } = req.body;
  if (password !== config.adminPassword) {
    return res.status(401).json({ error: 'Неверный пароль' });
  }
  const token = signToken('admin');
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  res.json({ ok: true, role: 'admin' });
});

router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

router.get('/me', (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.json({ role: null });
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    res.json({ role: payload.role });
  } catch {
    res.json({ role: null });
  }
});

export default router;
