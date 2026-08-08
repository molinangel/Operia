import type { Prisma, Priority } from "@prisma/client";
import type { Ctx } from "../context";
import { db } from "../db";
import { NotFoundError } from "../errors";

/**
 * Repositorio de trabajos.
 *
 * TODA consulta filtra por ctx.orgId. No hay excepciones ni atajos: es la
 * segunda de las tres capas que impiden que una organización vea datos de otra.
 */

export type JobFilters = {
  statusId?: string;
  contactId?: string;
  assetId?: string;
  assignedToId?: string;
  priority?: Priority;
  search?: string;
  overdue?: boolean;
  unassigned?: boolean;
};

function toWhere(ctx: Ctx, filters: JobFilters = {}): Prisma.JobWhereInput {
  const where: Prisma.JobWhereInput = { orgId: ctx.orgId, archivedAt: null };

  if (filters.statusId) where.statusId = filters.statusId;
  if (filters.contactId) where.contactId = filters.contactId;
  if (filters.assetId) where.assetId = filters.assetId;
  if (filters.priority) where.priority = filters.priority;
  if (filters.assignedToId) where.assignedToId = filters.assignedToId;
  if (filters.unassigned) where.assignedToId = null;

  if (filters.overdue) {
    where.dueAt = { lt: new Date() };
    where.completedAt = null;
  }

  if (filters.search?.trim()) {
    const q = filters.search.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { code: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { contact: { name: { contains: q, mode: "insensitive" } } },
      { asset: { label: { contains: q, mode: "insensitive" } } },
    ];
  }

  return where;
}

const listInclude = {
  status: true,
  contact: { select: { id: true, name: true, phone: true } },
  asset: { select: { id: true, label: true, identifier: true } },
} satisfies Prisma.JobInclude;

export type JobListItem = Prisma.JobGetPayload<{ include: typeof listInclude }>;

export const jobsRepo = {
  /** Tablero: todos los trabajos abiertos agrupados después por estado. */
  async board(ctx: Ctx, filters: JobFilters = {}) {
    const [statuses, jobs] = await Promise.all([
      db.jobStatus.findMany({
        where: { orgId: ctx.orgId, archivedAt: null },
        orderBy: { position: "asc" },
      }),
      db.job.findMany({
        where: toWhere(ctx, filters),
        include: listInclude,
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        take: 400, // tope de seguridad: más que esto no se lee en un tablero
      }),
    ]);

    return { statuses, jobs };
  },

  /** Lista paginada por cursor. Nunca OFFSET: a los 10.000 registros se arrastra. */
  async list(
    ctx: Ctx,
    filters: JobFilters = {},
    cursor?: string,
    take = 40,
  ) {
    const jobs = await db.job.findMany({
      where: toWhere(ctx, filters),
      include: listInclude,
      orderBy: { createdAt: "desc" },
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = jobs.length > take;
    return {
      items: hasMore ? jobs.slice(0, take) : jobs,
      nextCursor: hasMore ? jobs[take - 1].id : null,
    };
  },

  async byId(ctx: Ctx, id: string) {
    const job = await db.job.findFirst({
      where: { id, orgId: ctx.orgId },
      include: {
        status: true,
        contact: true,
        asset: true,
        items: { orderBy: { position: "asc" } },
        // Sin filtro de archivado: los pagos son append-only. Una anulación
        // aparece como un movimiento inverso, y verla es lo correcto.
        payments: { orderBy: { paidAt: "desc" }, include: { reverses: true, reversedBy: true } },
        documents: {
          where: { archivedAt: null },
          orderBy: { createdAt: "desc" },
          select: {
            id: true, kind: true, number: true, status: true,
            totalCents: true, issuedAt: true, publicToken: true,
          },
        },
        appointments: { where: { archivedAt: null }, orderBy: { startsAt: "asc" } },
      },
    });

    // 404 y no 403: un 403 confirmaría que el trabajo existe en otra organización.
    if (!job) throw new NotFoundError("No encontramos ese trabajo.");
    return job;
  },

  async countThisMonth(ctx: Ctx) {
    const from = new Date();
    from.setDate(1);
    from.setHours(0, 0, 0, 0);

    return db.job.count({
      where: { orgId: ctx.orgId, createdAt: { gte: from } },
    });
  },

  /** Métricas del panel de inicio. Una sola ida a la base por métrica. */
  async dashboardStats(ctx: Ctx) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [open, overdue, completedThisMonth, unpaid, statuses] =
      await Promise.all([
        db.job.count({
          where: {
            orgId: ctx.orgId,
            archivedAt: null,
            status: { kind: { in: ["OPEN", "IN_PROGRESS", "WAITING"] } },
          },
        }),
        db.job.count({
          where: {
            orgId: ctx.orgId,
            archivedAt: null,
            dueAt: { lt: new Date() },
            completedAt: null,
          },
        }),
        db.job.count({
          where: {
            orgId: ctx.orgId,
            archivedAt: null,
            completedAt: { gte: startOfMonth },
          },
        }),
        db.job.aggregate({
          where: {
            orgId: ctx.orgId,
            archivedAt: null,
            status: { kind: "DONE" },
          },
          _sum: { totalCents: true, paidCents: true },
        }),
        db.jobStatus.findMany({
          where: { orgId: ctx.orgId, archivedAt: null },
          orderBy: { position: "asc" },
          select: {
            id: true, name: true, color: true, kind: true,
            _count: { select: { jobs: { where: { archivedAt: null } } } },
          },
        }),
      ]);

    const pendingCents =
      (unpaid._sum.totalCents ?? 0) - (unpaid._sum.paidCents ?? 0);

    return {
      open,
      overdue,
      completedThisMonth,
      pendingCents: Math.max(0, pendingCents),
      statuses,
    };
  },

  async recent(ctx: Ctx, take = 6) {
    return db.job.findMany({
      where: { orgId: ctx.orgId, archivedAt: null },
      include: listInclude,
      orderBy: { updatedAt: "desc" },
      take,
    });
  },
};

export const statusesRepo = {
  list(ctx: Ctx) {
    return db.jobStatus.findMany({
      where: { orgId: ctx.orgId, archivedAt: null },
      orderBy: { position: "asc" },
    });
  },

  async defaultStatus(ctx: Ctx) {
    const status =
      (await db.jobStatus.findFirst({
        where: { orgId: ctx.orgId, archivedAt: null, isDefault: true },
      })) ??
      (await db.jobStatus.findFirst({
        where: { orgId: ctx.orgId, archivedAt: null },
        orderBy: { position: "asc" },
      }));

    if (!status) {
      throw new NotFoundError(
        "Tu cuenta no tiene estados configurados. Creá uno en Configuración.",
      );
    }
    return status;
  },
};
