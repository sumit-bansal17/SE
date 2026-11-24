import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
dotenv.config({ path: path.join(rootDir, '.env') });

/**
 * Prisma CLI resolves SQLite paths relative to prisma/schema.prisma.
 * Prisma Client resolves them relative to process.cwd().
 * Always pin the dev file to <repo>/prisma/dev.db so migrate/seed/server agree.
 */
export function resolveDatabaseUrl() {
  const raw = process.env.DATABASE_URL || 'file:./dev.db';
  if (!raw.startsWith('file:')) return raw;
  const filePath = raw.slice('file:'.length);
  if (path.isAbsolute(filePath)) return `file:${filePath}`;
  return `file:${path.join(rootDir, 'prisma', 'dev.db')}`;
}

export const prisma = new PrismaClient({
  datasources: { db: { url: resolveDatabaseUrl() } },
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});
