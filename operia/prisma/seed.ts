import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config as loadEnv } from "dotenv";
import { PLANS } from "../src/lib/plans";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ path: ".env", quiet: true });

/**
 * Seed.
 *
 * Carga ÚNICAMENTE los planes de suscripción, que son configuración del sistema.
 * No crea organizaciones, usuarios ni datos de ejemplo: cada cuenta se configura
 * sola al registrarse, con el preset de su rubro. Ver CLAUDE.md §4.7.
 */
async function main() {
  const connectionString =
    process.env.DATABASE_URL ?? process.env.DATABASE_URL_UNPOOLED;

  if (!connectionString) {
    throw new Error(
      "Falta DATABASE_URL. Copiá .env.example a .env.local y completalo.",
    );
  }

  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  for (const [index, plan] of PLANS.entries()) {
    await db.plan.upsert({
      where: { code: plan.code },
      create: {
        code: plan.code,
        name: plan.name,
        priceCents: plan.priceCents,
        currency: plan.currency,
        maxUsers: plan.maxUsers,
        maxJobsMonth: plan.maxJobsMonth,
        maxContacts: plan.maxContacts,
        maxStorageMb: plan.maxStorageMb,
        features: plan.features,
        position: index,
      },
      update: {
        name: plan.name,
        priceCents: plan.priceCents,
        maxUsers: plan.maxUsers,
        maxJobsMonth: plan.maxJobsMonth,
        maxContacts: plan.maxContacts,
        maxStorageMb: plan.maxStorageMb,
        features: plan.features,
        position: index,
      },
    });
    console.log(`  plan «${plan.name}» listo`);
  }

  await db.$disconnect();
  console.log("Seed completado.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
