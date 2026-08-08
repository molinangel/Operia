"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertCan, requireCtx } from "../context";
import { type ActionResult, toActionError } from "../errors";
import {
  addJobItem,
  archiveJob,
  createJob,
  removeJobItem,
  updateJob,
  updateJobStatus,
} from "../services/jobs";

const prioritySchema = z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]);

const createSchema = z.object({
  orgSlug: z.string().min(1),
  title: z.string().trim().min(1, "Escribí de qué se trata.").max(160),
  description: z.string().trim().max(4000).optional(),
  contactId: z.string().optional(),
  assetId: z.string().optional(),
  statusId: z.string().optional(),
  priority: prioritySchema.optional(),
  dueAt: z.string().optional(),
  customFields: z.record(z.string(), z.unknown()).optional(),
});

export async function createJobAction(
  raw: unknown,
): Promise<ActionResult<{ id: string; code: string }>> {
  try {
    const input = createSchema.parse(raw);
    const ctx = await requireCtx(input.orgSlug);
    assertCan(ctx, "job:write");

    const job = await createJob(ctx, {
      title: input.title,
      description: input.description,
      contactId: input.contactId || null,
      assetId: input.assetId || null,
      statusId: input.statusId,
      priority: input.priority,
      dueAt: input.dueAt ? new Date(input.dueAt) : null,
      customFields: input.customFields,
    });

    revalidatePath(`/app/${input.orgSlug}/trabajos`);
    revalidatePath(`/app/${input.orgSlug}`);

    return { ok: true, data: { id: job.id, code: job.code } };
  } catch (error) {
    return toActionError(error);
  }
}

const statusSchema = z.object({
  orgSlug: z.string().min(1),
  jobId: z.string().min(1),
  statusId: z.string().min(1),
});

export async function moveJobAction(raw: unknown): Promise<ActionResult<null>> {
  try {
    const input = statusSchema.parse(raw);
    const ctx = await requireCtx(input.orgSlug);
    assertCan(ctx, "job:write");

    await updateJobStatus(ctx, input.jobId, input.statusId);

    revalidatePath(`/app/${input.orgSlug}/trabajos`);
    revalidatePath(`/app/${input.orgSlug}/trabajos/${input.jobId}`);

    return { ok: true, data: null };
  } catch (error) {
    return toActionError(error);
  }
}

const updateSchema = createSchema
  .partial()
  .extend({ orgSlug: z.string().min(1), jobId: z.string().min(1) });

export async function updateJobAction(raw: unknown): Promise<ActionResult<null>> {
  try {
    const input = updateSchema.parse(raw);
    const ctx = await requireCtx(input.orgSlug);
    assertCan(ctx, "job:write");

    await updateJob(ctx, input.jobId, {
      title: input.title,
      description: input.description,
      contactId: input.contactId,
      assetId: input.assetId,
      priority: input.priority,
      dueAt: input.dueAt ? new Date(input.dueAt) : undefined,
      customFields: input.customFields,
    });

    revalidatePath(`/app/${input.orgSlug}/trabajos/${input.jobId}`);
    revalidatePath(`/app/${input.orgSlug}/trabajos`);

    return { ok: true, data: null };
  } catch (error) {
    return toActionError(error);
  }
}

const itemSchema = z.object({
  orgSlug: z.string().min(1),
  jobId: z.string().min(1),
  description: z.string().trim().min(1, "Poné una descripción.").max(300),
  quantity: z.coerce.number().positive("La cantidad debe ser mayor que cero."),
  unitPriceCents: z.coerce.number().int().min(0),
  taxRate: z.coerce.number().min(0).max(100).optional(),
  discountPct: z.coerce.number().min(0).max(100).optional(),
  productId: z.string().optional(),
});

export async function addJobItemAction(raw: unknown): Promise<ActionResult<null>> {
  try {
    const input = itemSchema.parse(raw);
    const ctx = await requireCtx(input.orgSlug);
    assertCan(ctx, "job:write");

    await addJobItem(ctx, input.jobId, {
      description: input.description,
      quantity: input.quantity,
      unitPriceCents: input.unitPriceCents,
      taxRate: input.taxRate,
      discountPct: input.discountPct,
      productId: input.productId || null,
    });

    revalidatePath(`/app/${input.orgSlug}/trabajos/${input.jobId}`);
    return { ok: true, data: null };
  } catch (error) {
    return toActionError(error);
  }
}

export async function removeJobItemAction(
  raw: unknown,
): Promise<ActionResult<null>> {
  try {
    const input = z
      .object({
        orgSlug: z.string().min(1),
        jobId: z.string().min(1),
        itemId: z.string().min(1),
      })
      .parse(raw);

    const ctx = await requireCtx(input.orgSlug);
    assertCan(ctx, "job:write");

    await removeJobItem(ctx, input.jobId, input.itemId);

    revalidatePath(`/app/${input.orgSlug}/trabajos/${input.jobId}`);
    return { ok: true, data: null };
  } catch (error) {
    return toActionError(error);
  }
}

export async function archiveJobAction(raw: unknown): Promise<ActionResult<null>> {
  try {
    const input = z
      .object({ orgSlug: z.string().min(1), jobId: z.string().min(1) })
      .parse(raw);

    const ctx = await requireCtx(input.orgSlug);
    assertCan(ctx, "job:delete");

    await archiveJob(ctx, input.jobId);

    revalidatePath(`/app/${input.orgSlug}/trabajos`);
    return { ok: true, data: null };
  } catch (error) {
    return toActionError(error);
  }
}
