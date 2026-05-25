import { config } from '../config.js';

export const PLAYER_ROLE = config.playerRole;
export const TEST_ROLE = config.testRole;
export const ADMIN_ROLE = 'admin';
export const PLAYER_ROLES = [PLAYER_ROLE, TEST_ROLE];

export function getUserIdForRole(role) {
  const r = normalizeRole(role);
  if (r === TEST_ROLE) return config.testWalletUserId;
  return config.walletUserId;
}

export function getDisplayNameForRole(role) {
  const r = normalizeRole(role);
  if (r === TEST_ROLE) return config.testName;
  if (r === PLAYER_ROLE) return config.playerName;
  return '';
}

export function isPlayerRole(role) {
  return PLAYER_ROLES.includes(normalizeRole(role));
}

export function roleAllowed(tokenRole, allowedRoles) {
  const role = normalizeRole(tokenRole);
  const allowed = allowedRoles.map(normalizeRole);
  if (allowed.includes(role)) return true;
  if (isPlayerRole(role) && allowed.some((r) => isPlayerRole(r))) return true;
  return false;
}

/** dashenka → test (старое имя) */
export function normalizeRole(role) {
  if (role === 'dashenka') return TEST_ROLE;
  return role;
}
