import { PrismaClient } from '@prisma/client'
import { initializeDatabase } from './db-init'

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

let initializationPromise: Promise<void> | null = null;

export async function ensureDatabaseInitialized(seed = false): Promise<void> {
  if (!initializationPromise) {
    initializationPromise = initializeDatabase(prisma, seed)
      .catch((error) => {
        initializationPromise = null;
        throw error;
      });
  }
  return initializationPromise;
}

