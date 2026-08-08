import type { Prisma } from "@prisma/client";
import type { Ctx } from "../context";
import { db } from "../db";
import { NotFoundError } from "../errors";

export type ContactFilters = {
  search?: string;
  isSupplier?: boolean;
  withDebt?: boolean;
};

function toWhere(ctx: Ctx, filters: ContactFilters = {}): Prisma.ContactWhereInput {
  const where: Prisma.ContactWhereInput = { orgId: ctx.orgId, archivedAt: null };

  if (filters.isSupplier !== undefined) where.isSupplier = filters.isSupplier;

  if (filters.search?.trim()) {
    const q = filters.search.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { email: { contains: q, mode: "insensitive" } },
      { taxId: { contains: q, mode: "insensitive" } },
    ];
  }

  return where;
}

export const contactsRepo = {
  async list(ctx: Ctx, filters: ContactFilters = {}, cursor?: string, take = 40) {
    const items = await db.contact.findMany({
      where: toWhere(ctx, filters),
      orderBy: { name: "asc" },
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: { _count: { select: { jobs: true, assets: true } } },
    });

    const hasMore = items.length > take;
    return {
      items: hasMore ? items.slice(0, take) : items,
      nextCursor: hasMore ? items[take - 1].id : null,
    };
  },

  /** Selector rápido para formularios. Se limita a 20: más que eso se busca escribiendo. */
  search(ctx: Ctx, query: string, take = 20) {
    return db.contact.findMany({
      where: toWhere(ctx, { search: query }),
      orderBy: { name: "asc" },
      take,
      select: { id: true, name: true, phone: true, email: true },
    });
  },

  async byId(ctx: Ctx, id: string) {
    const contact = await db.contact.findFirst({
      where: { id, orgId: ctx.orgId },
      include: {
        assets: { where: { archivedAt: null }, orderBy: { createdAt: "desc" } },
        jobs: {
          where: { archivedAt: null },
          orderBy: { createdAt: "desc" },
          take: 30,
          include: { status: true },
        },
        payments: {
          orderBy: { paidAt: "desc" },
          take: 20,
          include: { reverses: true, reversedBy: true },
        },
      },
    });

    if (!contact) throw new NotFoundError("No encontramos ese contacto.");
    return contact;
  },

  /**
   * Saldo del contacto: lo facturado en trabajos entregados menos lo cobrado.
   * Se calcula, no se guarda — un total desnormalizado siempre termina desfasado.
   */
  async balance(ctx: Ctx, contactId: string) {
    const result = await db.job.aggregate({
      where: {
        orgId: ctx.orgId,
        contactId,
        archivedAt: null,
        status: { kind: "DONE" },
      },
      _sum: { totalCents: true, paidCents: true },
    });

    return Math.max(
      0,
      (result._sum.totalCents ?? 0) - (result._sum.paidCents ?? 0),
    );
  },

  count(ctx: Ctx) {
    return db.contact.count({ where: { orgId: ctx.orgId, archivedAt: null } });
  },

  /** Aviso de posible duplicado: no bloquea, solo advierte. A veces son legítimos. */
  async findSimilar(ctx: Ctx, phone?: string | null, email?: string | null) {
    if (!phone && !email) return null;

    return db.contact.findFirst({
      where: {
        orgId: ctx.orgId,
        archivedAt: null,
        OR: [
          ...(phone ? [{ phone }] : []),
          ...(email ? [{ email }] : []),
        ],
      },
      select: { id: true, name: true, phone: true, email: true },
    });
  },
};

export const assetsRepo = {
  async list(ctx: Ctx, search?: string, contactId?: string, take = 60) {
    const where: Prisma.AssetWhereInput = { orgId: ctx.orgId, archivedAt: null };
    if (contactId) where.contactId = contactId;

    if (search?.trim()) {
      const q = search.trim();
      where.OR = [
        { label: { contains: q, mode: "insensitive" } },
        { identifier: { contains: q, mode: "insensitive" } },
        { contact: { name: { contains: q, mode: "insensitive" } } },
      ];
    }

    return db.asset.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      include: {
        contact: { select: { id: true, name: true } },
        _count: { select: { jobs: true } },
      },
    });
  },

  async byId(ctx: Ctx, id: string) {
    const asset = await db.asset.findFirst({
      where: { id, orgId: ctx.orgId },
      include: {
        contact: true,
        jobs: {
          where: { archivedAt: null },
          orderBy: { createdAt: "desc" },
          include: { status: true },
        },
      },
    });

    if (!asset) throw new NotFoundError("No encontramos ese registro.");
    return asset;
  },
};

export const productsRepo = {
  list(ctx: Ctx, search?: string) {
    const where: Prisma.ProductWhereInput = { orgId: ctx.orgId, archivedAt: null };

    if (search?.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { sku: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    return db.product.findMany({ where, orderBy: { name: "asc" }, take: 200 });
  },

  async byId(ctx: Ctx, id: string) {
    const product = await db.product.findFirst({
      where: { id, orgId: ctx.orgId },
    });
    if (!product) throw new NotFoundError("No encontramos ese ítem del catálogo.");
    return product;
  },
};

export const customFieldsRepo = {
  list(ctx: Ctx, entity: "CONTACT" | "ASSET" | "JOB" | "PRODUCT") {
    return db.customFieldDef.findMany({
      where: { orgId: ctx.orgId, entity, archivedAt: null },
      orderBy: { position: "asc" },
    });
  },
};
