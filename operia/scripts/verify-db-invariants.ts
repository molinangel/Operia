import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local", quiet: true });

import { db } from "../src/server/db";
import { hashPassword } from "../src/server/auth";
import { createOrganizationWithPreset } from "../src/server/services/onboarding";

/**
 * VERIFICACIÓN DE INVARIANTES EN LA BASE DE DATOS
 *
 * Patrón traído de SH: las reglas críticas viven como restricciones de
 * Postgres, no como validaciones que la aplicación recuerda hacer.
 *
 * Este script intenta violarlas a propósito, saltándose por completo la capa
 * de servicios. Si alguna pasa, la restricción no está haciendo su trabajo.
 *
 *   npx tsx scripts/verify-db-invariants.ts
 */

let failures = 0;

function ok(label: string, passed: boolean, detail = "") {
  console.log(
    `[${passed ? "  OK  " : " FALLA"}] ${label}${detail ? ` — ${detail}` : ""}`,
  );
  if (!passed) failures++;
}

/** Espera que la operación sea rechazada por la base. */
async function mustReject(label: string, fn: () => Promise<unknown>) {
  try {
    await fn();
    ok(label, false, "la base LO ACEPTÓ — la restricción no protege");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const constraint = message.match(/chk_\w+|excl_\w+/)?.[0] ?? "rechazado";
    ok(label, true, constraint);
  }
}

async function mustAccept(label: string, fn: () => Promise<unknown>) {
  try {
    await fn();
    ok(label, true);
  } catch (error) {
    ok(label, false, error instanceof Error ? error.message.slice(0, 90) : "");
  }
}

async function main() {
  const stamp = Date.now();

  const user = await db.user.create({
    data: {
      email: `inv-${stamp}@operia.test`,
      name: "Invariantes",
      passwordHash: await hashPassword("contrasena-de-prueba-1234"),
    },
  });

  const org = await createOrganizationWithPreset({
    userId: user.id,
    orgName: `Invariantes ${stamp}`,
    industryKey: "automotriz",
  });

  const status = await db.jobStatus.findFirstOrThrow({
    where: { orgId: org.id, isDefault: true },
  });
  const contact = await db.contact.create({
    data: { orgId: org.id, name: "Cliente de control" },
  });
  const job = await db.job.create({
    data: {
      orgId: org.id,
      code: "INV-0001",
      title: "Trabajo de control",
      statusId: status.id,
      contactId: contact.id,
    },
  });

  const base = new Date("2026-09-01T14:00:00Z");
  const hour = 3_600_000;

  console.log("\n── Agenda: anti-solape ─────────────────────────────────\n");

  await mustAccept("Primera cita de la mañana", () =>
    db.appointment.create({
      data: {
        orgId: org.id,
        title: "Turno de las 10",
        startsAt: base,
        endsAt: new Date(base.getTime() + hour),
        assignedToId: user.id,
        status: "SCHEDULED",
      },
    }),
  );

  await mustReject(
    "Misma persona, horario superpuesto → RECHAZADO",
    () =>
      db.appointment.create({
        data: {
          orgId: org.id,
          title: "Turno que pisa al anterior",
          startsAt: new Date(base.getTime() + hour / 2),
          endsAt: new Date(base.getTime() + hour * 2),
          assignedToId: user.id,
          status: "SCHEDULED",
        },
      }),
  );

  await mustAccept("Misma persona, horario contiguo sin pisar", () =>
    db.appointment.create({
      data: {
        orgId: org.id,
        title: "Turno siguiente",
        startsAt: new Date(base.getTime() + hour),
        endsAt: new Date(base.getTime() + hour * 2),
        assignedToId: user.id,
        status: "SCHEDULED",
      },
    }),
  );

  await mustAccept("Sin responsable asignado, puede superponerse", () =>
    db.appointment.create({
      data: {
        orgId: org.id,
        title: "Turno sin asignar",
        startsAt: base,
        endsAt: new Date(base.getTime() + hour),
        status: "SCHEDULED",
      },
    }),
  );

  await mustAccept("Una cita cancelada no bloquea el horario", () =>
    db.appointment.create({
      data: {
        orgId: org.id,
        title: "Turno cancelado",
        startsAt: base,
        endsAt: new Date(base.getTime() + hour),
        assignedToId: user.id,
        status: "CANCELLED",
      },
    }),
  );

  await mustReject("Fin anterior al inicio → RECHAZADO", () =>
    db.appointment.create({
      data: {
        orgId: org.id,
        title: "Cita imposible",
        startsAt: new Date(base.getTime() + hour),
        endsAt: base,
      },
    }),
  );

  console.log("\n── Dinero ──────────────────────────────────────────────\n");

  await mustReject("Pago de importe cero o negativo → RECHAZADO", () =>
    db.payment.create({
      data: {
        orgId: org.id,
        jobId: job.id,
        amountCents: 0,
        method: "Efectivo",
      },
    }),
  );

  await mustReject("Tasa de cambio negativa → RECHAZADO", () =>
    db.payment.create({
      data: {
        orgId: org.id,
        jobId: job.id,
        amountCents: 1000,
        method: "Efectivo",
        exchangeRate: -5,
      },
    }),
  );

  await mustAccept("Pago válido con tasa e importe base", () =>
    db.payment.create({
      data: {
        orgId: org.id,
        jobId: job.id,
        amountCents: 50_000,
        currency: "VES",
        exchangeRate: 40.5,
        baseAmountCents: 1234,
        method: "Pago móvil",
      },
    }),
  );

  await mustReject("Cotización con moneda base igual → RECHAZADO", () =>
    db.exchangeRate.create({
      data: {
        orgId: org.id,
        currency: "USD",
        baseCurrency: "USD",
        rate: 1,
        effectiveOn: new Date("2026-09-01"),
      },
    }),
  );

  await mustAccept("Cotización válida", () =>
    db.exchangeRate.create({
      data: {
        orgId: org.id,
        currency: "VES",
        baseCurrency: "USD",
        rate: 40.5,
        effectiveOn: new Date("2026-09-01"),
      },
    }),
  );

  console.log("\n── Líneas de trabajo ───────────────────────────────────\n");

  await mustReject("Cantidad cero → RECHAZADO", () =>
    db.jobItem.create({
      data: {
        orgId: org.id,
        jobId: job.id,
        description: "Línea inválida",
        quantity: 0,
        unitPriceCents: 100,
      },
    }),
  );

  await mustReject("Precio negativo → RECHAZADO", () =>
    db.jobItem.create({
      data: {
        orgId: org.id,
        jobId: job.id,
        description: "Línea inválida",
        quantity: 1,
        unitPriceCents: -100,
      },
    }),
  );

  await mustReject("Descuento mayor a 100% → RECHAZADO", () =>
    db.jobItem.create({
      data: {
        orgId: org.id,
        jobId: job.id,
        description: "Línea inválida",
        quantity: 1,
        unitPriceCents: 100,
        discountPct: 150,
      },
    }),
  );

  await mustAccept("Línea válida", () =>
    db.jobItem.create({
      data: {
        orgId: org.id,
        jobId: job.id,
        description: "Diagnóstico",
        quantity: 1,
        unitPriceCents: 2500,
        totalCents: 2500,
      },
    }),
  );

  console.log("\n── Limpieza ────────────────────────────────────────────\n");

  await db.organization.delete({ where: { id: org.id } });
  await db.user.delete({ where: { id: user.id } });
  ok("Datos de prueba eliminados", true);

  console.log(
    failures === 0
      ? "\n✅ Todas las invariantes protegen. Ni saltándose la aplicación se pueden violar.\n"
      : `\n❌ ${failures} invariante(s) no protegen. Revisar la migración.\n`,
  );

  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error("\nError inesperado:", error);
  process.exit(1);
});
