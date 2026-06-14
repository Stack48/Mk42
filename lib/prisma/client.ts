// PRISMA CLIENT — Singleton
//
// Next.js en mode dev recharge les modules fréquemment (Hot Module Replacement).
// Sans ce singleton, chaque reload crée une nouvelle connexion PostgreSQL
// → on épuise rapidement le pool de connexions.
//
// Solution : stocker l'instance dans global (qui persiste entre les reloads)
// et ne la créer qu'une seule fois.
//
// En prod (NODE_ENV=production), le module n'est chargé qu'une fois → pas de problème.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
