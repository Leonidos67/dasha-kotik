import { config } from '../config.js';

export function publicUploadUrl(relativePath) {
  if (!relativePath) return '';
  if (relativePath.startsWith('http')) return relativePath;
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  if (config.apiPublicUrl) {
    return `${config.apiPublicUrl}${path}`;
  }
  return path;
}
