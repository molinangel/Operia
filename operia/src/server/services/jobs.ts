import type { Prisma } from "@prisma/client";
import { computeLine, computeTotals } from "@/lib/money";
import type { Ctx } from "../context";
import { db } from "../db";
import { NotFoundError, ValidationError } from "../errors";
import { logActivity, logAudit } from "./activity";

/**
 * Reglas de negocio de los trabajos.
 *
 * Lo que el esquema no puede expresar vive acá: numeración transaccional,
 * recálculo de totales y transiciones de estado.
 */

/**
 * Numeración visible.
 *
 * Se incrementa el contador de la organización DENTRO de la transacción. Si se
 * hiciera fuera, dos usuarios creando un trabajo al mismo tiempo obtendrían el
 * mismo número — y descubrirlo en producción, con documentos ya emitidos, es
 * un problema muy caro de arreglar.
 */
async function nextJobCode(tx: Prisma.TransactionClient, orgId: string) {
  const org = await tx.organization.update({
    where: { id: orgId },
    data: { jobCounter: { increment: 1 } },
    select: { jobCounter: true },
  });
  return `OT-${String(org.jobCounter).padStart(5, "0")}`;
}

export async function createJob(
  ctx: Ctx,
  input: {
    title: string;
    description?: string;
    contactId?: string | null;
    assetId?: string | null;
    statusId?: string;
    priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
    assignedToId?: string | null;
    dueAt?: Date | null;
    customFields?: Record<string, unknown>;
  },
) {
  if (!input.title.trim()) {
    throw new ValidationError("El trabajo necesita un título.", {
      title: "Escribí de qué se trata.",
    });
  }

  // Las referencias se validan contra la MISMA organización antes de usarlas.
  if (input.contactId) await assertBelongs(ctx, "contact", input.contactId);
  if (input.assetId) await assertBelongs(ctx, "asset", input.assetId);

  const statusId =
    input.statusId ??
    (
      await db.jobStatus.findFirst({
        where: { orgId: ctx.orgId, archivedAt: null, isDefault: true },
        select: { id: true },
      })
    )?.id;

  if (!statusId) {
    throw new ValidationError(
      "Tu cuenta no tiene un estado inicial configurado.",
    );
  }
  await assertBelongs(ctx, "jobStatus", statusId);

  const job = await db.$transaction(
    async (tx) => {
      const code = await nextJobCode(tx, ctx.orgId);

      return tx.job.create({
        data: {
          orgId: ctx.orgId,
          code,
          title: input.title.trim(),
          description: input.description?.trim() || null,
          contactId: input.contactId || null,
          assetId: input.assetId || null,
          statusId,
          priority: input.priority ?? "NORMAL",
          assignedToId: input.assignedToId || null,
          dueAt: input.dueAt ?? null,
          customFields: (input.customFields ?? {}) as Prisma.InputJsonValue,
          createdById: ctx.user.id,
        },
        include: { status: true },
      });
    },
    { timeout: 20_000 },
  );

  await logActivity(ctx, "job", job.id, "created", `creó ${job.code}`);
  await logAudit(ctx, "job.create", "job", job.id, null, { code: job.code });

  return job;
}

export async function updateJobStatus(
  ctx: Ctx,
  jobId: string,
  statusId: string,
) {
  const [job, status] = await Promise.all([
    db.job.findFirst({
      where: { id: jobId, orgId: ctx.orgId },
      include: { status: true },
    }),
    db.jobStatus.findFirst({ where: { id: statusId, orgId: ctx.orgId } }),
  ]);

  if (!job) throw new NotFoundError("No encontramos ese trabajo.");
  if (!status) throw new NotFoundError("Ese estado no existe.");
  if (job.statusId === statusId) return job;

  // Las marcas de tiempo se derivan de la categoría del estado, no del nombre:
  // así funcionan igual aunque el cliente renombre sus estados.
  const data: Prisma.JobUpdateInput = { status: { connect: { id: statusId } } };

  if (status.kind === "DONE" && !job.completedAt) data.completedAt = new Date();
  if (status.kind !== "DONE") data.completedAt = null;
  if (status.kind === "IN_PROGRESS" && !job.startedAt) data.startedAt = new Date();

  const updated = await db.job.update({
    where: { id: jobId },
    data,
    include: { status: true, contact: true, asset: true },
  });

  await logActivity(
    ctx,
    "job",
    jobId,
    "status_changed",
    `cambió el estado de «${job.status.name}» a «${status.name}»`,
    { from: job.status.name, to: status.name },
  );
  await logAudit(ctx, "job.status", "job", jobId,
    { statusId: job.statusId }, { statusId });

  return updated;
}

export async function updateJob(
  ctx: Ctx,
  jobId: string,
  input: {
    title?: string;
    description?: string | null;
    contactId?: string | null;
    assetId?: string | null;
    priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
    assignedToId?: string | null;
    dueAt?: Date | null;
    customFields?: Record<string, unknown>;
  },
) {
  const existing = await db.job.findFirst({
    where: { id: jobId, orgId: ctx.orgId },
  });
  if (!existing) throw new NotFoundError("No encontramos ese trabajo.");

  if (input.contactId) await assertBelongs(ctx, "contact", input.contactId);
  if (input.assetId) await assertBelongs(ctx, "asset", input.assetId);

  const updated = await db.job.update({
    where: { id: jobId },
    data: {
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.description !== undefined
        ? { description: input.description?.trim() || null }
        : {}),
      ...(input.contactId !== undefined ? { contactId: input.contactId || null } : {}),
      ...(input.assetId !== undefined ? { assetId: input.assetId || null } : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.assignedToId !== undefined
        ? { assignedToId: input.assignedToId || null }
        : {}),
      ...(input.dueAt !== undefined ? { dueAt: input.dueAt } : {}),
      ...(input.customFields !== undefined
        ? { customFields: input.customFields as Prisma.InputJsonValue }
        : {}),
    },
    include: { status: true },
  });

  await logAudit(ctx, "job.update", "job", jobId, existing, updated);
  return updated;
}

// ── Ítems y totales ───────────────────────────────────────────────

/**
 * Recalcula los totales del trabajo desde sus ítems.
 *
 * Se ejecuta en el SERVIDOR siempre. El navegador puede mostrar una vista
 * previa, pero el número que vale es el que sale de acá: si el cliente reclama
 * por un importe, la cuenta tiene que poder reproducirse exactamente.
 */
export async function recalcJobTotals(
  ctx: Ctx,
  jobId: string,
  tx: Prisma.TransactionClient = db,
) {
  const [items, payments] = await Promise.all([
    tx.jobItem.findMany({ where: { jobId, orgId: ctx.orgId } }),
    /*
      Cobrado = entradas menos salidas.

      Los pagos son append-only: una anulación no borra el original, agrega su
      inverso. Por eso hay que restar los OUT en vez de filtrar por archivado.
      Es más simple y no se puede olvidar el filtro en otra consulta.
    */
    tx.payment.groupBy({
      by: ["direction"],
      where: { jobId, orgId: ctx.orgId },
      _sum: { amountCents: true },
    }),
  ]);

  const totals = computeTotals(
    items.map((item) => ({
      quantity: Number(item.quantity),
      unitPriceCents: item.unitPriceCents,
      taxRate: Number(item.taxRate),
      discountPct: Number(item.discountPct),
    })),
  );

  return tx.job.update({
    where: { id: jobId },
    data: {
      subtotalCents: totals.subtotalCents,
      taxCents: totals.taxCents,
      totalCents: totals.totalCents,
      paidCents:
        (payments.find((r) => r.direction === "IN")?._sum.amountCents ?? 0) -
        (payments.find((r) => r.direction === "OUT")?._sum.amountCents ?? 0),
    },
  });
}

export async function addJobItem(
  ctx: Ctx,
  jobId: string,
  input: {
    description: string;
    quantity: number;
    unitPriceCents: number;
    taxRate?: number;
    discountPct?: number;
    productId?: string | null;
  },
) {
  const job = await db.job.findFirst({
    where: { id: jobId, orgId: ctx.orgId },
    select: { id: true },
  });
  if (!job) throw new NotFoundError("No encontramos ese trabajo.");

  if (!input.description.trim()) {
    throw new ValidationError("El ítem necesita una descripción.");
  }
  if (input.quantity <= 0) {
    throw new ValidationError("La cantidad tiene que ser mayor que cero.");
  }

  const line = computeLine({
    quantity: input.quantity,
    unitPriceCents: input.unitPriceCents,
    taxRate: input.taxRate ?? 0,
    discountPct: input.discountPct ?? 0,
  });

  const count = await db.jobItem.count({ where: { jobId } });

  await db.$transaction(async (tx) => {
    await tx.jobItem.create({
      data: {
        orgId: ctx.orgId,
        jobId,
        productId: input.productId || null,
        description: input.description.trim(),
        quantity: input.quantity,
        unitPriceCents: input.unitPriceCents,
        taxRate: input.taxRate ?? 0,
        discountPct: input.discountPct ?? 0,
        totalCents: line.totalCents,
        position: count,
      },
    });
    await recalcJobTotals(ctx, jobId, tx);
  });
}

export async function removeJobItem(ctx: Ctx, jobId: string, itemId: string) {
  const item = await db.jobItem.findFirst({
    where: { id: itemId, jobId, orgId: ctx.orgId },
  });
  if (!item) throw new NotFoundError("No encontramos ese ítem.");

  await db.$transaction(async (tx) => {
    await tx.jobItem.delete({ where: { id: itemId } });
    await recalcJobTotals(ctx, jobId, tx);
  });
}

export async function archiveJob(ctx: Ctx, jobId: string) {
  const job = await db.job.findFirst({
    where: { id: jobId, orgId: ctx.orgId },
    select: { id: true, code: true },
  });
  if (!job) throw new NotFoundError("No encontramos ese trabajo.");

  // Se archiva, nunca se borra: el historial es el activo del cliente.
  await db.job.update({
    where: { id: jobId },
    data: { archivedAt: new Date() },
  });

  await logAudit(ctx, "job.archive", "job", jobId, { code: job.code }, null);
}

// ── Utilidad ──────────────────────────────────────────────────────

/**
 * Verifica que un id pertenezca a la organización del contexto.
 *
 * Sin esto, alguien podría enviar el id de un contacto ajeno en el formulario y
 * vincularlo a su propio trabajo. Es el vector de ataque más fácil de olvidar.
 */
async function assertBelongs(
  ctx: Ctx,
  model: "contact" | "asset" | "jobStatus" | "product",
  id: string,
) {
  const table = {
    contact: db.contact,
    asset: db.asset,
    jobStatus: db.jobStatus,
    product: db.product,
  }[model];

  const found = await (table as { findFirst: (a: unknown) => Promise<unknown> })
    .findFirst({ where: { id, orgId: ctx.orgId }, select: { id: true } });

  if (!found) throw new NotFoundError("Alguno de los datos seleccionados no existe.");
}
