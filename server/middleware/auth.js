import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { normalizeRole, roleAllowed } from '../utils/roles.js';

export function signToken(role) {
  return jwt.sign({ role: normalizeRole(role) }, config.jwtSecret, { expiresIn: '30d' });
}

export function authRequired(roles = []) {
  return (req, res, next) => {
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : null);

    if (!token) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    try {
      const payload = jwt.verify(token, config.jwtSecret);
      const role = normalizeRole(payload.role);
      if (roles.length && !roleAllowed(role, roles.map(normalizeRole))) {
        return res.status(403).json({ error: 'Нет доступа' });
      }
      req.user = { ...payload, role };
      next();
    } catch {
      return res.status(401).json({ error: 'Сессия истекла' });
    }
  };
}
