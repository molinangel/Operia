import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

/**
 * Cliente Prisma único y perezoso.
 *
 * SINGLETON: en desarrollo Next.js recarga los módulos en cada cambio; sin el
 * global se abriría una conexión nueva por recarga hasta agotar el pool de
 * Postgres. Es un problema clásico y silencioso.
 *
 * PEREZOSO: el cliente se crea en el primer uso real, no al importar el módulo.
 * Si se creara al importar, `next build` fallaría al analizar cualquier página
 * que toque el servidor sin tener la base configurada — y el build de la landing
 * no necesita base de datos para nada.
 *
 * Desde Prisma 7 la conexión se pasa por adaptador, no por schema.prisma.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "Falta DATABASE_URL. Copiá .env.example a .env.local y completá la cadena " +
        "de conexión de Supabase (ver docs/10-checklist-cuentas-y-tokens.md).",
    );
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient();
  }
  return globalForPrisma.prisma;
}

/**
 * Se expone un Proxy para que `db.user.findMany()` funcione igual que siempre,
 * pero la conexión no se abra hasta que alguien la use de verdad.
 */
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver);
  },
});
