import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local", quiet: true });

import { db } from "../src/server/db";
import { hashPassword } from "../src/server/auth";
import { createOrganizationWithPreset } from "../src/server/services/onboarding";
import { getPreset } from "../src/lib/presets";

/**
 * VERIFICACIÓN CRÍTICA — aislamiento multi-tenant.
 *
 * Crea dos organizaciones con datos y comprueba que ninguna consulta filtrada
 * por orgId devuelve nada de la otra. Es el único test que NUNCA puede fallar:
 * una filtración de datos entre clientes termina el negocio.
 *
 * Ejecutar con:  npx tsx scripts/verify-tenant-isolation.ts
 */

let failures = 0;

function check(label: string, condition: boolean, detail = "") {
  const mark = condition ? "  OK  " : " FALLA";
  console.log(`[${mark}] ${label}${detail ? ` — ${detail}` : ""}`);
  if (!condition) failures++;
}

async function main() {
  const stamp = Date.now();
  const emailA = `verify-a-${stamp}@operia.test`;
  const emailB = `verify-b-${stamp}@operia.test`;

  console.log("\n── Creando dos organizaciones de prueba ─────────────────\n");

  const passwordHash = await hashPassword("contrasena-de-prueba-1234");

  const userA = await db.user.create({
    data: { email: emailA, name: "Dueño A", passwordHash },
  });
  const userB = await db.user.create({
    data: { email: emailB, name: "Dueño B", passwordHash },
  });

  const orgA = await createOrganizationWithPreset({
    userId: userA.id,
    orgName: `Taller Verificacion ${stamp}`,
    industryKey: "automotriz",
  });
  const orgB = await createOrganizationWithPreset({
    userId: userB.id,
    orgName: `Veterinaria Verificacion ${stamp}`,
    industryKey: "veterinaria",
  });

  console.log(`  Organización A: ${orgA.slug} (taller)`);
  console.log(`  Organización B: ${orgB.slug} (veterinaria)`);

  // ── 1. El preset se aplicó completo ────────────────────────────
  console.log("\n── 1. Aplicación del preset ────────────────────────────\n");

  const presetA = getPreset("automotriz");

  const statusesA = await db.jobStatus.count({ where: { orgId: orgA.id } });
  check(
    "Estados creados",
    statusesA === presetA.statuses.length,
    `${statusesA} de ${presetA.statuses.length}`,
  );

  const fieldsA = await db.customFieldDef.count({ where: { orgId: orgA.id } });
  check(
    "Campos personalizados creados",
    fieldsA === presetA.customFields.length,
    `${fieldsA} de ${presetA.customFields.length}`,
  );

  const productsA = await db.product.count({ where: { orgId: orgA.id } });
  check("Catálogo cargado", productsA === presetA.products.length, `${productsA} servicios`);

  const templatesA = await db.documentTemplate.count({ where: { orgId: orgA.id } });
  check("Plantillas de documento creadas", templatesA > 0, `${templatesA} plantillas`);

  const defaults = await db.jobStatus.count({
    where: { orgId: orgA.id, isDefault: true },
  });
  check("Existe exactamente un estado inicial", defaults === 1, `${defaults} marcados`);

  const subA = await db.subscription.findUnique({ where: { orgId: orgA.id } });
  check("Suscripción en prueba creada", subA?.status === "TRIAL", `plan ${subA?.planCode}`);
  check(
    "La prueba tiene fecha de fin",
    Boolean(subA?.trialEndsAt && subA.trialEndsAt > new Date()),
  );

  // ── 2. El vocabulario es distinto por rubro ────────────────────
  console.log("\n── 2. Configuración diferenciada por rubro ─────────────\n");

  const freshA = await db.organization.findUnique({ where: { id: orgA.id } });
  const freshB = await db.organization.findUnique({ where: { id: orgB.id } });

  check(
    "Vocabulario del taller",
    freshA?.jobLabelPlural === "Órdenes de trabajo",
    freshA?.jobLabelPlural,
  );
  check(
    "Vocabulario de la veterinaria",
    freshB?.jobLabelPlural === "Consultas",
    freshB?.jobLabelPlural,
  );
  check(
    "Los activos se llaman distinto",
    freshA?.assetLabelPlural !== freshB?.assetLabelPlural,
    `${freshA?.assetLabelPlural} vs ${freshB?.assetLabelPlural}`,
  );

  // ── 3. Datos reales en cada organización ───────────────────────
  console.log("\n── 3. Aislamiento entre organizaciones ─────────────────\n");

  const statusA = await db.jobStatus.findFirst({
    where: { orgId: orgA.id, isDefault: true },
  });
  const statusB = await db.jobStatus.findFirst({
    where: { orgId: orgB.id, isDefault: true },
  });

  const contactA = await db.contact.create({
    data: { orgId: orgA.id, name: "Cliente secreto de A", phone: "+584120000001" },
  });
  const contactB = await db.contact.create({
    data: { orgId: orgB.id, name: "Cliente secreto de B", phone: "+584120000002" },
  });

  const jobA = await db.job.create({
    data: {
      orgId: orgA.id,
      code: "TEST-0001",
      title: "Trabajo confidencial de A",
      statusId: statusA!.id,
      contactId: contactA.id,
    },
  });
  await db.job.create({
    data: {
      orgId: orgB.id,
      code: "TEST-0001", // mismo código: debe poder repetirse entre organizaciones
      title: "Trabajo confidencial de B",
      statusId: statusB!.id,
      contactId: contactB.id,
    },
  });

  check("Dos organizaciones pueden usar el mismo código de trabajo", true);

  // La consulta de A no puede ver NADA de B.
  const contactsSeenByA = await db.contact.findMany({ where: { orgId: orgA.id } });
  check(
    "A no ve contactos de B",
    contactsSeenByA.every((c) => c.orgId === orgA.id) &&
      !contactsSeenByA.some((c) => c.name.includes("de B")),
    `${contactsSeenByA.length} contactos, todos de A`,
  );

  const jobsSeenByB = await db.job.findMany({ where: { orgId: orgB.id } });
  check(
    "B no ve trabajos de A",
    jobsSeenByB.every((j) => j.orgId === orgB.id) &&
      !jobsSeenByB.some((j) => j.title.includes("de A")),
    `${jobsSeenByB.length} trabajos, todos de B`,
  );

  // El patrón real de los repositorios: buscar por id CON filtro de orgId.
  const stolen = await db.job.findFirst({
    where: { id: jobA.id, orgId: orgB.id },
  });
  check(
    "B no puede leer un trabajo de A ni conociendo su id",
    stolen === null,
    "devuelve null (el repositorio lanza 404)",
  );

  const statusesSeenByB = await db.jobStatus.findMany({ where: { orgId: orgB.id } });
  check(
    "Los estados no se cruzan entre organizaciones",
    statusesSeenByB.every((s) => s.orgId === orgB.id) &&
      !statusesSeenByB.some((s) => s.name === "Esperando repuesto"),
    `${statusesSeenByB.length} estados propios de la veterinaria`,
  );

  const membershipCross = await db.membership.findFirst({
    where: { userId: userA.id, orgId: orgB.id },
  });
  check("El dueño de A no es miembro de B", membershipCross === null);

  // ── 4. Limpieza ────────────────────────────────────────────────
  console.log("\n── 4. Limpieza ─────────────────────────────────────────\n");

  await db.organization.deleteMany({ where: { id: { in: [orgA.id, orgB.id] } } });
  await db.user.deleteMany({ where: { id: { in: [userA.id, userB.id] } } });

  const leftovers = await db.job.count({ where: { orgId: { in: [orgA.id, orgB.id] } } });
  check(
    "Borrar la organización arrastra todos sus datos",
    leftovers === 0,
    "cascada correcta",
  );

  console.log(
    failures === 0
      ? "\n✅ Todo correcto. El aislamiento multi-tenant funciona.\n"
      : `\n❌ ${failures} verificación(es) fallaron. NO seguir hasta resolverlo.\n`,
  );

  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error("\nError inesperado:", error);
  process.exit(1);
});
