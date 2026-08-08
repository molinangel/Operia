import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// La CLI de Prisma no lee .env.local por su cuenta (eso lo hace Next.js).
// Se cargan ambos: .env.local tiene prioridad sobre .env.
loadEnv({ path: ".env.local", quiet: true });
loadEnv({ path: ".env", quiet: true });

/**
 * Configuración de la CLI de Prisma (v7).
 *
 * Desde Prisma 7 la URL de conexión ya no vive en schema.prisma: las migraciones
 * y la introspección la leen desde acá, y el cliente en tiempo de ejecución la
 * recibe a través de un adaptador (ver src/server/db.ts).
 *
 * Se prefiere la conexión directa (no la del pool) porque las migraciones
 * necesitan una sesión estable: con el pooler de Neon fallan de forma intermitente.
 *
 * El valor de reserva permite ejecutar `prisma generate` sin base de datos
 * configurada, que es lo que ocurre al clonar el repositorio por primera vez.
 */
const url =
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.DATABASE_URL ??
  "postgresql://sin-configurar:sin-configurar@localhost:5432/operia";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: { url },
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});
