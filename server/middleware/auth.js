import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { normalizeRole, roleAllowed } from '../utils/roles.js';
import { getTokenFromRequest } from '../utils/token.js';

export function signToken(role) {
  return jwt.sign({ role: normalizeRole(role) }, config.jwtSecret, { expiresIn: '30d' });
}

export function authRequired(roles = []) {
  return (req, res, next) => {
    const token = getTokenFromRequest(req);

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
