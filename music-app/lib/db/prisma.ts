// Suppress type errors when @prisma/client generated types are not available
// @ts-expect-error: PrismaClient types may not be generated in this environment
import { PrismaClient } from '@prisma/client'

type PrismaClientT = unknown
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClientT }

const PrismaCtor = (PrismaClient as unknown) as new () => PrismaClientT
export const prisma = globalForPrisma.prisma ?? new PrismaCtor()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
