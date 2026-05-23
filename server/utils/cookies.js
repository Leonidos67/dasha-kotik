import { config } from '../config.js';

export function authCookieOptions() {
  const crossSite = config.isProduction;

  return {
    httpOnly: true,
    secure: crossSite,
    sameSite: crossSite ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/',
  };
}
