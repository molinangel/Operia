import type { Prisma } from "@prisma/client";
import type { Ctx } from "../context";
import { db } from "../db";

/**
 * Dos registros distintos, con propósitos distintos:
 *
 *  · Activity  — lo que ve el usuario. "Juan cambió el estado a Listo."
 *                Es parte del producto: le da al dueño trazabilidad de su equipo.
 *
 *  · AuditLog  — lo que ves vos. Antes y después de cada cambio, con ip y agente.
 *                Es lo que te salva cuando un cliente dice "yo no toqué eso".
 *
 * Ninguno de los dos puede hacer fallar la operación principal: si el registro
 * falla, se anota en consola y se sigue. Perder una línea de historial es
 * molesto; perder el trabajo del usuario por eso sería inaceptable.
 */

export async function logActivity(
  ctx: Ctx,
  entityType: string,
  entityId: string,
  type: string,
  message: string,
  meta: Record<string, unknown> = {},
) {
  try {
    await db.activity.create({
      data: {
        orgId: ctx.orgId,
        entityType,
        entityId,
        type,
        message,
        meta: meta as Prisma.InputJsonValue,
        userId: ctx.user.id,
        userName: ctx.user.name ?? ctx.user.email,
      },
    });
  } catch (error) {
    console.error("[activity] no se pudo registrar:", error);
  }
}

export async function logAudit(
  ctx: Ctx,
  action: string,
  entityType: string,
  entityId: string,
  before: unknown,
  after: unknown,
) {
  try {
    await db.auditLog.create({
      data: {
        orgId: ctx.orgId,
        userId: ctx.user.id,
        action,
        entityType,
        entityId,
        before: sanitize(before),
        after: sanitize(after),
      },
    });
  } catch (error) {
    console.error("[audit] no se pudo registrar:", error);
  }
}

/** Prisma no serializa Date ni Decimal a JSON por su cuenta. */
function sanitize(value: unknown): Prisma.InputJsonValue {
  if (value === null || value === undefined) return {};
  return JSON.parse(
    JSON.stringify(value, (_key, val) =>
      typeof val === "bigint" || typeof val === "object"
        ? val instanceof Date
          ? val.toISOString()
          : val
        : val,
    ),
  );
}

export function timeline(ctx: Ctx, entityType: string, entityId: string) {
  return db.activity.findMany({
    where: { orgId: ctx.orgId, entityType, entityId },
    orderBy: { createdAt: "desc" },
    take: 60,
  });
}
