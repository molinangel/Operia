import type { Organization, Role } from "@prisma/client";
import { cache } from "react";
import { type Permission, permissionsFor } from "@/lib/permissions";
import { requireUser, type SessionUser } from "./auth";
import { db } from "./db";
import { ForbiddenError, NotFoundError } from "./errors";

/**
 * CONTEXTO DE PETICIÓN — la pieza más importante del sistema.
 *
 * Ninguna consulta de datos se ejecuta sin pasar por acá primero. El `orgId`
 * que devuelve es el único que los repositorios pueden usar como filtro.
 *
 * Si esto falla, se filtran datos entre clientes. Es el único error del que un
 * negocio de software no se recupera, así que se defiende en tres capas:
 *   1. Este contexto, que verifica la membresía.
 *   2. Los repositorios, que filtran siempre por ctx.orgId.
 *   3. El test automatizado de aislamiento, que nunca puede fallar.
 */
export type Ctx = {
  user: SessionUser;
  org: Organization;
  orgId: string;
  role: Role;
  permissions: Set<Permission>;
};

async function resolveCtx(orgSlug: string): Promise<Ctx> {
  const user = await requireUser();

  const membership = await db.membership.findFirst({
    where: {
      userId: user.id,
      archivedAt: null,
      org: { slug: orgSlug, archivedAt: null },
    },
    include: { org: true },
  });

  // 404 y no 403: si el usuario no es miembro, para él esa organización no existe.
  if (!membership) throw new NotFoundError();

  return {
    user,
    org: membership.org,
    orgId: membership.orgId,
    role: membership.role,
    permissions: permissionsFor(membership.role),
  };
}

/** Deduplicado por petición: el layout y la página lo piden y se resuelve una vez. */
export const requireCtx = cache(resolveCtx);

export function assertCan(ctx: Ctx, permission: Permission) {
  if (!ctx.permissions.has(permission)) {
    throw new ForbiddenError(
      "Tu rol no permite esta acción. Pedile a un administrador que la haga.",
    );
  }
}

/** Organizaciones a las que pertenece el usuario — alimenta el selector superior. */
export const listUserOrgs = cache(async (userId: string) => {
  const memberships = await db.membership.findMany({
    where: { userId, archivedAt: null, org: { archivedAt: null } },
    include: { org: { select: { id: true, name: true, slug: true, industryKey: true } } },
    orderBy: { createdAt: "asc" },
  });
  return memberships.map((m) => ({ ...m.org, role: m.role }));
});

/** Etiquetas configurables de la organización, para no repetir la lógica en cada vista. */
export function vocab(org: Organization) {
  return {
    job: org.jobLabelSingular,
    jobs: org.jobLabelPlural,
    asset: org.assetLabelSingular,
    assets: org.assetLabelPlural,
    useAssets: org.useAssets,
  };
}
