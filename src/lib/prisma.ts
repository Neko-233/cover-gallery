import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

// Function to add timeout parameters to the database URL if they don't exist
const getOptimizedDatabaseUrl = () => {
  let url = process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL || '';
  
  if (!url) return undefined;

  // If it's not a postgres URL (e.g. sqlite), return as is
  if (!url.startsWith('postgres')) return url;

  // Add connect_timeout if missing
  if (!url.includes('connect_timeout=')) {
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}connect_timeout=30`;
  }

  // Add pool_timeout if missing
  if (!url.includes('pool_timeout=')) {
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}pool_timeout=60`;
  }

  return url;
};

const optimizedUrl = getOptimizedDatabaseUrl();

const client = optimizedUrl
  ? new PrismaClient({
      log: ['error'],
      datasources: { db: { url: optimizedUrl } },
    })
  : new PrismaClient({ log: ['error'] });

try {
  const url = process.env.DATABASE_URL || '';
  const DEBUG_PRISMA = process.env.DEBUG_PRISMA === '1';
  if ((url.startsWith('file:') || url.startsWith('sqlite:')) && DEBUG_PRISMA) {
    console.log(JSON.stringify({ ts: Date.now(), mod: 'prisma', msg: 'warn_sqlite', databaseUrl: url }));
  }
} catch {}

export const prisma = globalForPrisma.prisma || client;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
