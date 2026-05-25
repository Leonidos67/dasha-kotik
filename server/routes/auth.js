import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { signToken } from '../middleware/auth.js';
import { authCookieOptions } from '../utils/cookies.js';
import {
  ADMIN_ROLE,
  getDisplayNameForRole,
  normalizeRole,
  PLAYER_ROLE,
  TEST_ROLE,
} from '../utils/roles.js';
import { getTokenFromRequest } from '../utils/token.js';

const router = Router();

function sendAuth(res, role, extra = {}) {
  const token = signToken(role);
  res.cookie('token', token, authCookieOptions());
  res.json({
    ok: true,
    role,
    token,
    name: getDisplayNameForRole(role),
    ...extra,
  });
}

router.post('/dasha', (req, res) => {
  const { password } = req.body;
  if (password !== config.playerPassword) {
    return res.status(401).json({ error: 'Неверный пароль' });
  }
  sendAuth(res, PLAYER_ROLE);
});

router.post('/test', (req, res) => {
  const { password } = req.body;
  if (password !== config.testPassword) {
    return res.status(401).json({ error: 'Неверный пароль' });
  }
  sendAuth(res, TEST_ROLE);
});

router.post('/dashenka', (_req, res) => {
  res.status(410).json({ error: 'Вход «Дашенька» отключён. Выбери «тест» или «Даша».' });
});

router.post('/admin', (req, res) => {
  const { password } = req.body;
  if (password !== config.adminPassword) {
    return res.status(401).json({ error: 'Неверный пароль' });
  }
  sendAuth(res, ADMIN_ROLE);
});

router.post('/logout', (_req, res) => {
  res.clearCookie('token', authCookieOptions());
  res.json({ ok: true });
});

router.get('/me', (req, res) => {
  const token = getTokenFromRequest(req);
  if (!token) return res.json({ role: null });
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const role = normalizeRole(payload.role);
    if (role === PLAYER_ROLE || role === TEST_ROLE) {
      return res.json({ role, name: getDisplayNameForRole(role) });
    }
    res.json({ role });
  } catch {
    res.json({ role: null });
  }
});

export default router;
