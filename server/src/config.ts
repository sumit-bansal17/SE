import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
dotenv.config({ path: path.join(rootDir, '.env') });

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in the environment');
  }
  process.env.JWT_SECRET = 'tiet_sync_dev_only_change_me';
}

export const config = {
  port: parseInt(process.env.PORT || '5050', 10),
  jwtSecret: process.env.JWT_SECRET,
  jwtIssuer: process.env.JWT_ISSUER || 'tiet-sync',
  jwtAudience: process.env.JWT_AUDIENCE || 'tiet-sync-app',
  cookieName: process.env.AUTH_COOKIE_NAME || 'tiet_sync_token',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  maxUploadSizeBytes: 10 * 1024 * 1024,
  maxUserStorageBytes: parseInt(process.env.MAX_USER_STORAGE_BYTES || String(20 * 1024 * 1024), 10),
};
