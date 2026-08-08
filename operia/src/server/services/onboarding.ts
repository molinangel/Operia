import type { Prisma } from "@prisma/client";
import { BASE_DOC_HTML, getPreset } from "@/lib/presets";
import { slugify } from "@/lib/utils";
import { db } from "../db";
import { ConflictError } from "../errors";

/**
 * Creación de una organización a partir de un preset de rubro.
 *
 * TODO en una sola transacción: si algo falla no puede quedar una organización a
 * medio configurar. Un usuario que entra y ve algo roto no vuelve nunca.
 *
 * El preset SOLO escribe acá. Después de este momento no se vuelve a consultar:
 * la configuración pasa a ser propiedad del cliente y puede cambiarla entera.
 */
export async function createOrganizationWithPreset(input: {
  userId: string;
  orgName: string;
  industryKey: string;
  currency?: string;
  timezone?: string;
  planCode?: string;
  trialDays?: number;
}) {
  const preset = getPreset(input.industryKey);
  const slug = await uniqueSlug(input.orgName);

  return db.$transaction(
    async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: input.orgName,
          slug,
          industryKey: preset.key,
          currency: input.currency ?? "USD",
          timezone: input.timezone ?? "America/Caracas",
          legalName: input.orgName,
          jobLabelSingular: preset.vocabulary.jobSingular,
          jobLabelPlural: preset.vocabulary.jobPlural,
          assetLabelSingular: preset.vocabulary.assetSingular,
          assetLabelPlural: preset.vocabulary.assetPlural,
          useAssets: preset.vocabulary.useAssets,
          paymentMethods: preset.paymentMethods,
        },
      });

      await tx.membership.create({
        data: { userId: input.userId, orgId: org.id, role: "OWNER" },
      });

      await tx.jobStatus.createMany({
        data: preset.statuses.map((status, i) => ({
          orgId: org.id,
          name: status.name,
          kind: status.kind,
          color: status.color,
          position: i,
          isDefault: status.isDefault ?? false,
        })),
      });

      if (preset.customFields.length) {
        await tx.customFieldDef.createMany({
          data: preset.customFields.map((field, i) => ({
            orgId: org.id,
            entity: field.entity,
            key: field.key,
            label: field.label,
            type: field.type,
            options: (field.options ?? []) as Prisma.InputJsonValue,
            required: field.required ?? false,
            showInList: field.showInList ?? false,
            position: i,
          })),
        });
      }

      if (preset.products.length) {
        await tx.product.createMany({
          data: preset.products.map((product) => ({
            orgId: org.id,
            name: product.name,
            kind: product.kind,
            priceCents: product.priceCents,
          })),
        });
      }

      await tx.notificationRule.createMany({
        data: preset.notificationRules.map((rule) => ({
          orgId: org.id,
          event: rule.event,
          channel: rule.channel,
          offsetMinutes: rule.offsetMinutes,
          bodyTemplate: rule.bodyTemplate,
        })),
      });

      // Una plantilla por tipo de documento: la primera de cada tipo es la predeterminada.
      const seenKinds = new Set<string>();
      await tx.documentTemplate.createMany({
        data: preset.documentTemplates.map((template) => {
          const isFirst = !seenKinds.has(template.kind);
          seenKinds.add(template.kind);
          return {
            orgId: org.id,
            kind: template.kind,
            name: template.name,
            bodyHtml: BASE_DOC_HTML,
            footerNote: template.footerNote,
            isDefault: isFirst,
          };
        }),
      });

      const trialDays = input.trialDays ?? 14;
      await tx.subscription.create({
        data: {
          orgId: org.id,
          planCode: input.planCode ?? "pro", // la prueba es siempre con el plan completo
          status: "TRIAL",
          trialEndsAt: new Date(Date.now() + trialDays * 86_400_000),
          provider: "manual",
        },
      });

      return org;
    },
    {
      /**
       * El registro hace ~8 idas y vueltas a la base. Con la latencia real hacia
       * el servidor (200–800 ms por consulta desde Latinoamérica), los 5 s por
       * defecto de Prisma se agotan y el alta falla a mitad de camino.
       *
       * Verificado contra la base de producción, no supuesto: el registro
       * tardaba 6,8 s. Ver scripts/verify-tenant-isolation.ts
       */
      timeout: 30_000,
      maxWait: 15_000,
    },
  );
}

/**
 * Slug único. Se reintenta con sufijo numérico porque dos negocios pueden
 * llamarse igual, y fallar el registro por eso sería absurdo.
 */
async function uniqueSlug(name: string) {
  const base = slugify(name) || "negocio";

  for (let attempt = 0; attempt < 30; attempt++) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const taken = await db.organization.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!taken) return candidate;
  }

  throw new ConflictError(
    "No pudimos generar una dirección para tu negocio. Probá con otro nombre.",
  );
}

/** Slugs reservados: no pueden usarse como nombre de organización. */
export const RESERVED_SLUGS = new Set([
  "app", "admin", "api", "login", "registro", "precios", "terminos",
  "privacidad", "p", "invitacion", "sitemap", "robots", "static", "public",
  "soporte", "ayuda", "blog", "docs",
]);
