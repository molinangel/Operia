import type { Prisma } from "@prisma/client";
import { roundCents } from "@/lib/money";
import type { Ctx } from "../context";
import { db } from "../db";
import { ConflictError, NotFoundError, ValidationError } from "../errors";
import { logActivity, logAudit } from "./activity";
import { recalcJobTotals } from "./jobs";

/**
 * COBROS
 *
 * Regla inviolable: **un pago nunca se edita ni se borra.**
 *
 * Está tomada del libro contable de SH, que corrige con asiento inverso en vez
 * de tocar el original. La razón no es purismo: si un registro de dinero se
 * puede modificar, el historial deja de servir como prueba. Cuando un cliente
 * discute un saldo, lo único que cierra la discusión es poder mostrar cada
 * movimiento con su fecha, su autor y su motivo.
 *
 * Un error se corrige creando un pago inverso enlazado al original. Los dos
 * quedan visibles y la cuenta se reconstruye sumando.
 */

/**
 * Cotización vigente para una moneda en una fecha.
 *
 * Busca la última cotización con fecha igual o anterior a la del cobro. Si no
 * hay ninguna, devuelve null y el pago se guarda sin importe base: es preferible
 * un dato faltante y visible a un número inventado con la tasa de hoy.
 *
 * SH resolvió esto mismo con un fallback, y es la diferencia entre una caja que
 * cuadra y una que no, en cualquier economía con inflación.
 */
export async function rateFor(
  ctx: Ctx,
  currency: string,
  on: Date,
): Promise<number | null> {
  if (currency === ctx.org.currency) return 1;

  const quote = await db.exchangeRate.findFirst({
    where: {
      orgId: ctx.orgId,
      currency,
      baseCurrency: ctx.org.currency,
      effectiveOn: { lte: on },
    },
    orderBy: { effectiveOn: "desc" },
  });

  return quote ? Number(quote.rate) : null;
}

export async function setRate(
  ctx: Ctx,
  input: { currency: string; rate: number; effectiveOn: Date; source?: string },
) {
  if (input.currency === ctx.org.currency) {
    throw new ValidationError(
      "La moneda base no necesita cotización contra sí misma.",
    );
  }
  if (input.rate <= 0) {
    throw new ValidationError("La tasa tiene que ser mayor que cero.");
  }

  const day = startOfDay(input.effectiveOn);

  return db.exchangeRate.upsert({
    where: {
      orgId_currency_effectiveOn: {
        orgId: ctx.orgId,
        currency: input.currency,
        effectiveOn: day,
      },
    },
    create: {
      orgId: ctx.orgId,
      currency: input.currency,
      baseCurrency: ctx.org.currency,
      rate: input.rate,
      effectiveOn: day,
      source: input.source ?? "manual",
      createdById: ctx.user.id,
    },
    update: { rate: input.rate, source: input.source ?? "manual" },
  });
}

export async function registerPayment(
  ctx: Ctx,
  input: {
    amountCents: number;
    currency?: string;
    method: string;
    jobId?: string | null;
    contactId?: string | null;
    reference?: string;
    notes?: string;
    paidAt?: Date;
    /** Tasa declarada a mano. Prevalece sobre la cotización guardada. */
    exchangeRate?: number | null;
  },
) {
  if (input.amountCents <= 0) {
    throw new ValidationError("El importe tiene que ser mayor que cero.");
  }
  if (!input.method.trim()) {
    throw new ValidationError("Indicá con qué método se cobró.");
  }

  const currency = input.currency ?? ctx.org.currency;
  const paidAt = input.paidAt ?? new Date();

  // El trabajo y el contacto se validan contra la propia organización.
  let contactId = input.contactId ?? null;
  if (input.jobId) {
    const job = await db.job.findFirst({
      where: { id: input.jobId, orgId: ctx.orgId },
      select: { id: true, contactId: true },
    });
    if (!job) throw new NotFoundError("No encontramos ese trabajo.");
    contactId ??= job.contactId;
  }
  if (contactId) {
    const contact = await db.contact.findFirst({
      where: { id: contactId, orgId: ctx.orgId },
      select: { id: true },
    });
    if (!contact) throw new NotFoundError("No encontramos ese contacto.");
  }

  const rate = input.exchangeRate ?? (await rateFor(ctx, currency, paidAt));
  const baseAmountCents =
    rate !== null ? roundCents(input.amountCents / rate) : null;

  const payment = await db.$transaction(async (tx) => {
    const created = await tx.payment.create({
      data: {
        orgId: ctx.orgId,
        contactId,
        jobId: input.jobId ?? null,
        direction: "IN",
        amountCents: input.amountCents,
        currency,
        exchangeRate: rate,
        baseAmountCents,
        method: input.method.trim(),
        reference: input.reference?.trim() || null,
        notes: input.notes?.trim() || null,
        paidAt,
        createdById: ctx.user.id,
      },
    });

    if (input.jobId) await recalcJobTotals(ctx, input.jobId, tx);
    return created;
  });

  if (input.jobId) {
    await logActivity(
      ctx,
      "job",
      input.jobId,
      "payment",
      `registró un pago de ${input.amountCents / 100} ${currency}`,
      { paymentId: payment.id },
    );
  }
  await logAudit(ctx, "payment.create", "payment", payment.id, null, payment);

  return payment;
}

/**
 * Anula un pago creando su inverso.
 *
 * No se borra ni se marca: se agrega un movimiento de signo contrario que
 * apunta al original. Quien mire la cuenta ve las dos líneas y entiende qué
 * pasó, que es exactamente lo que hace falta cuando hay una discusión de plata.
 */
export async function reversePayment(
  ctx: Ctx,
  paymentId: string,
  reason: string,
) {
  if (!reason.trim()) {
    throw new ValidationError(
      "Escribí por qué se anula. Sin motivo, el historial no sirve de nada.",
    );
  }

  const original = await db.payment.findFirst({
    where: { id: paymentId, orgId: ctx.orgId },
    include: { reversedBy: { select: { id: true } } },
  });

  if (!original) throw new NotFoundError("No encontramos ese pago.");
  if (original.reversedBy) {
    throw new ConflictError("Ese pago ya fue anulado.");
  }
  if (original.reversesId) {
    throw new ConflictError(
      "No se puede anular una anulación. Registrá un pago nuevo si corresponde.",
    );
  }

  const reversal = await db.$transaction(async (tx) => {
    const created = await tx.payment.create({
      data: {
        orgId: ctx.orgId,
        contactId: original.contactId,
        jobId: original.jobId,
        direction: original.direction === "IN" ? "OUT" : "IN",
        amountCents: original.amountCents,
        currency: original.currency,
        // Se conserva la tasa ORIGINAL, no la de hoy: si se reconvirtiera con
        // la tasa actual, anular un cobro dejaría una diferencia en la caja.
        exchangeRate: original.exchangeRate,
        baseAmountCents: original.baseAmountCents,
        method: original.method,
        reference: original.reference,
        notes: `Anulación: ${reason.trim()}`,
        paidAt: new Date(),
        createdById: ctx.user.id,
        reversesId: original.id,
      },
    });

    if (original.jobId) await recalcJobTotals(ctx, original.jobId, tx);
    return created;
  });

  if (original.jobId) {
    await logActivity(
      ctx,
      "job",
      original.jobId,
      "payment_reversed",
      `anuló un pago: ${reason.trim()}`,
      { paymentId: original.id, reversalId: reversal.id },
    );
  }
  await logAudit(
    ctx,
    "payment.reverse",
    "payment",
    original.id,
    original,
    reversal,
  );

  return reversal;
}

/**
 * Saldo de un contacto.
 *
 * Los pagos anulados se compensan solos: el original suma y el inverso resta,
 * así que no hay que excluir nada. Es la ventaja del libro append-only frente
 * al borrado lógico, donde siempre hay que acordarse de filtrar.
 */
export async function contactBalance(ctx: Ctx, contactId: string) {
  const [billed, paid] = await Promise.all([
    db.job.aggregate({
      where: {
        orgId: ctx.orgId,
        contactId,
        archivedAt: null,
        status: { kind: "DONE" },
      },
      _sum: { totalCents: true },
    }),
    db.payment.groupBy({
      by: ["direction"],
      where: { orgId: ctx.orgId, contactId },
      _sum: { amountCents: true },
    }),
  ]);

  const inflow =
    paid.find((row) => row.direction === "IN")?._sum.amountCents ?? 0;
  const outflow =
    paid.find((row) => row.direction === "OUT")?._sum.amountCents ?? 0;

  return {
    billedCents: billed._sum.totalCents ?? 0,
    paidCents: inflow - outflow,
    balanceCents: (billed._sum.totalCents ?? 0) - (inflow - outflow),
  };
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
}

/** Los pagos no se editan. Existe solo para que quede escrito en el código. */
export function updatePayment(): never {
  throw new ConflictError(
    "Los pagos no se editan. Anulá el pago con su motivo y registrá uno nuevo.",
  );
}

export type PaymentWithReversal = Prisma.PaymentGetPayload<{
  include: { reverses: true; reversedBy: true };
}>;
