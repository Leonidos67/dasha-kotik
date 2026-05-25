import { config } from '../config.js';

export const PLAYER_ROLE = config.playerRole;
export const LEGACY_PLAYER_ROLE = 'dasha';
export const ADMIN_ROLE = 'admin';

export function isPlayerRole(role) {
  return role === PLAYER_ROLE || role === LEGACY_PLAYER_ROLE;
}

export function roleAllowed(tokenRole, allowedRoles) {
  if (allowedRoles.includes(tokenRole)) return true;
  if (isPlayerRole(tokenRole) && allowedRoles.some((r) => isPlayerRole(r) || r === PLAYER_ROLE)) {
    return true;
  }
  return false;
}

export function normalizeRole(role) {
  return role === LEGACY_PLAYER_ROLE ? PLAYER_ROLE : role;
}
