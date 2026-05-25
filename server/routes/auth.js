import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { signToken } from '../middleware/auth.js';
import { authCookieOptions } from '../utils/cookies.js';
import { ADMIN_ROLE, normalizeRole, PLAYER_ROLE } from '../utils/roles.js';

const router = Router();

router.post('/dashenka', (req, res) => {
  const { password } = req.body;
  if (password !== config.playerPassword) {
    return res.status(401).json({ error: 'Неверный пароль' });
  }
  const token = signToken(PLAYER_ROLE);
  res.cookie('token', token, authCookieOptions());
  res.json({ ok: true, role: PLAYER_ROLE, name: config.playerName });
});

/** Устарело — перелогиниться как Дашенька */
router.post('/dasha', (_req, res) => {
  res.status(410).json({ error: 'Вход «Даша» отключён. Выбери «Дашенька» и войди снова.' });
});

router.post('/admin', (req, res) => {
  const { password } = req.body;
  if (password !== config.adminPassword) {
    return res.status(401).json({ error: 'Неверный пароль' });
  }
  const token = signToken(ADMIN_ROLE);
  res.cookie('token', token, authCookieOptions());
  res.json({ ok: true, role: ADMIN_ROLE });
});

router.post('/logout', (_req, res) => {
  res.clearCookie('token', authCookieOptions());
  res.json({ ok: true });
});

router.get('/me', (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.json({ role: null });
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const role = normalizeRole(payload.role);
    if (role === PLAYER_ROLE) {
      return res.json({ role, name: config.playerName });
    }
    res.json({ role });
  } catch {
    res.json({ role: null });
  }
});

export default router;
