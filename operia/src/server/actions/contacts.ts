"use server";

import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertCan, requireCtx } from "../context";
import { db } from "../db";
import { type ActionResult, NotFoundError, toActionError } from "../errors";
import { contactsRepo } from "../repos/contacts";
import { logAudit } from "../services/activity";

/**
 * Normalización de teléfonos a E.164.
 *
 * Sin esto los enlaces de WhatsApp no funcionan, que es la mitad del valor del
 * producto. Se hace con reglas simples y sin dependencias: se limpia todo lo que
 * no sea dígito y se antepone el prefijo del país de la organización si falta.
 */
function normalizePhone(raw: string | undefined, defaultCountry = "58") {
  if (!raw?.trim()) return null;

  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;

  const clean = digits.replace(/^0+/, "");
  if (!clean) return null;

  // Si ya empieza con el prefijo del país y tiene largo de internacional, se respeta.
  if (clean.startsWith(defaultCountry) && clean.length >= 11) return `+${clean}`;

  return `+${defaultCountry}${clean}`;
}

const contactSchema = z.object({
  orgSlug: z.string().min(1),
  name: z.string().trim().min(2, "Escribí el nombre.").max(120),
  kind: z.enum(["PERSON", "COMPANY"]).optional(),
  phone: z.string().trim().max(30).optional(),
  email: z.string().trim().max(160).optional(),
  taxId: z.string().trim().max(40).optional(),
  address: z.string().trim().max(300).optional(),
  notes: z.string().trim().max(2000).optional(),
  isSupplier: z.boolean().optional(),
  customFields: z.record(z.string(), z.unknown()).optional(),
});

export async function createContactAction(
  raw: unknown,
): Promise<ActionResult<{ id: string; name: string; duplicateOf?: string }>> {
  try {
    const input = contactSchema.parse(raw);
    const ctx = await requireCtx(input.orgSlug);
    assertCan(ctx, "contact:write");

    const phone = normalizePhone(input.phone);
    const email = input.email?.toLowerCase() || null;

    // Se avisa del duplicado pero NO se bloquea: a veces son legítimos
    // (dos personas comparten un teléfono, una empresa tiene varios contactos).
    const similar = await contactsRepo.findSimilar(ctx, phone, email);

    const contact = await db.contact.create({
      data: {
        orgId: ctx.orgId,
        name: input.name.trim(),
        kind: input.kind ?? "PERSON",
        phone,
        email,
        taxId: input.taxId?.trim() || null,
        address: input.address?.trim() || null,
        notes: input.notes?.trim() || null,
        isSupplier: input.isSupplier ?? false,
        customFields: (input.customFields ?? {}) as Prisma.InputJsonValue,
      },
    });

    await logAudit(ctx, "contact.create", "contact", contact.id, null, contact);

    revalidatePath(`/app/${input.orgSlug}/contactos`);

    return {
      ok: true,
      data: {
        id: contact.id,
        name: contact.name,
        ...(similar ? { duplicateOf: similar.name } : {}),
      },
    };
  } catch (error) {
    return toActionError(error);
  }
}

export async function updateContactAction(
  raw: unknown,
): Promise<ActionResult<null>> {
  try {
    const input = contactSchema
      .partial()
      .extend({ orgSlug: z.string().min(1), contactId: z.string().min(1) })
      .parse(raw);

    const ctx = await requireCtx(input.orgSlug);
    assertCan(ctx, "contact:write");

    const existing = await db.contact.findFirst({
      where: { id: input.contactId, orgId: ctx.orgId },
    });
    if (!existing) throw new NotFoundError("No encontramos ese contacto.");

    const updated = await db.contact.update({
      where: { id: input.contactId },
      data: {
        ...(input.name !== undefined ? { name: input.name.trim() } : {}),
        ...(input.kind !== undefined ? { kind: input.kind } : {}),
        ...(input.phone !== undefined ? { phone: normalizePhone(input.phone) } : {}),
        ...(input.email !== undefined
          ? { email: input.email?.toLowerCase() || null }
          : {}),
        ...(input.taxId !== undefined ? { taxId: input.taxId?.trim() || null } : {}),
        ...(input.address !== undefined
          ? { address: input.address?.trim() || null }
          : {}),
        ...(input.notes !== undefined ? { notes: input.notes?.trim() || null } : {}),
        ...(input.isSupplier !== undefined ? { isSupplier: input.isSupplier } : {}),
        ...(input.customFields !== undefined
          ? { customFields: input.customFields as Prisma.InputJsonValue }
          : {}),
      },
    });

    await logAudit(ctx, "contact.update", "contact", updated.id, existing, updated);

    revalidatePath(`/app/${input.orgSlug}/contactos`);
    revalidatePath(`/app/${input.orgSlug}/contactos/${input.contactId}`);

    return { ok: true, data: null };
  } catch (error) {
    return toActionError(error);
  }
}

export async function archiveContactAction(
  raw: unknown,
): Promise<ActionResult<null>> {
  try {
    const input = z
      .object({ orgSlug: z.string().min(1), contactId: z.string().min(1) })
      .parse(raw);

    const ctx = await requireCtx(input.orgSlug);
    assertCan(ctx, "contact:delete");

    const existing = await db.contact.findFirst({
      where: { id: input.contactId, orgId: ctx.orgId },
      select: { id: true, name: true },
    });
    if (!existing) throw new NotFoundError("No encontramos ese contacto.");

    await db.contact.update({
      where: { id: input.contactId },
      data: { archivedAt: new Date() },
    });

    await logAudit(ctx, "contact.archive", "contact", existing.id, existing, null);

    revalidatePath(`/app/${input.orgSlug}/contactos`);
    return { ok: true, data: null };
  } catch (error) {
    return toActionError(error);
  }
}

// ── Activos ───────────────────────────────────────────────────────

const assetSchema = z.object({
  orgSlug: z.string().min(1),
  label: z.string().trim().min(1, "Escribí una descripción.").max(120),
  identifier: z.string().trim().max(80).optional(),
  contactId: z.string().optional(),
  notes: z.string().trim().max(2000).optional(),
  customFields: z.record(z.string(), z.unknown()).optional(),
});

export async function createAssetAction(
  raw: unknown,
): Promise<ActionResult<{ id: string; label: string }>> {
  try {
    const input = assetSchema.parse(raw);
    const ctx = await requireCtx(input.orgSlug);
    assertCan(ctx, "asset:write");

    if (input.contactId) {
      const owner = await db.contact.findFirst({
        where: { id: input.contactId, orgId: ctx.orgId },
        select: { id: true },
      });
      if (!owner) throw new NotFoundError("Ese contacto no existe.");
    }

    const asset = await db.asset.create({
      data: {
        orgId: ctx.orgId,
        label: input.label.trim(),
        identifier: input.identifier?.trim() || null,
        contactId: input.contactId || null,
        notes: input.notes?.trim() || null,
        customFields: (input.customFields ?? {}) as Prisma.InputJsonValue,
      },
    });

    await logAudit(ctx, "asset.create", "asset", asset.id, null, asset);

    revalidatePath(`/app/${input.orgSlug}/activos`);
    return { ok: true, data: { id: asset.id, label: asset.label } };
  } catch (error) {
    return toActionError(error);
  }
}
