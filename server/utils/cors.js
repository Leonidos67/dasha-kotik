import { config } from '../config.js';

export function corsOrigin(origin, callback) {
  if (!origin) {
    callback(null, true);
    return;
  }

  if (config.clientUrls.includes(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error(`CORS blocked: ${origin}`));
}
