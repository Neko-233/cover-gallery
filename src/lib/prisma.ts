import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const client = new PrismaClient({ log: ['error'] });
try {
  const url = process.env.DATABASE_URL || '';
  if (url.startsWith('file:') || url.startsWith('sqlite:')) {
    console.log(JSON.stringify({ ts: Date.now(), mod: 'prisma', msg: 'warn_sqlite', databaseUrl: url }));
  }
} catch {}

export const prisma = globalForPrisma.prisma || client;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
