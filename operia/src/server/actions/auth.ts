"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { PRESET_MAP } from "@/lib/presets";
import {
  assertPasswordStrength,
  checkRateLimit,
  clearRateLimit,
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from "../auth";
import { db } from "../db";
import {
  type ActionResult,
  ConflictError,
  toActionError,
  ValidationError,
} from "../errors";
import { createOrganizationWithPreset, RESERVED_SLUGS } from "../services/onboarding";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Ingresá tu email.")
  .email("Ese email no parece válido.");

const registerSchema = z.object({
  name: z.string().trim().min(2, "Ingresá tu nombre.").max(80),
  email: emailSchema,
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
  orgName: z
    .string()
    .trim()
    .min(2, "Ingresá el nombre de tu negocio.")
    .max(80),
  industryKey: z.string().trim().min(1),
  currency: z.string().trim().length(3).default("USD"),
  timezone: z.string().trim().min(1).default("America/Caracas"),
});

async function requestMeta() {
  const h = await headers();
  return {
    ip:
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      h.get("x-real-ip") ??
      undefined,
    userAgent: h.get("user-agent") ?? undefined,
  };
}

// ── REGISTRO ──────────────────────────────────────────────────────

export async function registerAction(
  raw: unknown,
): Promise<ActionResult<{ slug: string }>> {
  try {
    const parsed = registerSchema.safeParse(raw);
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        fields[key] ??= issue.message;
      }
      throw new ValidationError("Revisá los datos del formulario.", fields);
    }

    const data = parsed.data;
    const meta = await requestMeta();

    if (!checkRateLimit(`register:${meta.ip ?? "anon"}`, 5, 3_600_000)) {
      throw new ValidationError(
        "Demasiados intentos de registro. Probá de nuevo en una hora.",
      );
    }

    if (!PRESET_MAP.has(data.industryKey)) {
      throw new ValidationError("Elegí a qué se dedica tu negocio.", {
        industryKey: "Seleccioná un rubro.",
      });
    }

    if (RESERVED_SLUGS.has(data.orgName.trim().toLowerCase())) {
      throw new ValidationError("Ese nombre no está disponible.", {
        orgName: "Elegí otro nombre.",
      });
    }

    assertPasswordStrength(data.password);

    const existing = await db.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictError(
        "Ya existe una cuenta con ese email. Iniciá sesión o recuperá tu contraseña.",
      );
    }

    const user = await db.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash: await hashPassword(data.password),
      },
    });

    const org = await createOrganizationWithPreset({
      userId: user.id,
      orgName: data.orgName,
      industryKey: data.industryKey,
      currency: data.currency,
      timezone: data.timezone,
    });

    await createSession(user.id, meta);

    return { ok: true, data: { slug: org.slug } };
  } catch (error) {
    return toActionError(error);
  }
}

// ── INICIO DE SESIÓN ──────────────────────────────────────────────

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Ingresá tu contraseña."),
});

export async function loginAction(
  raw: unknown,
): Promise<ActionResult<{ slug: string | null }>> {
  try {
    const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) {
      throw new ValidationError("Ingresá tu email y tu contraseña.");
    }

    const { email, password } = parsed.data;
    const meta = await requestMeta();
    const limitKey = `login:${email}`;

    if (!checkRateLimit(limitKey, 8, 600_000)) {
      throw new ValidationError(
        "Demasiados intentos fallidos. Esperá 10 minutos y probá de nuevo.",
      );
    }

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, passwordHash: true },
    });

    // Mensaje idéntico en ambos casos: revelar si el email existe permite
    // enumerar cuentas.
    const invalid = new ValidationError("Email o contraseña incorrectos.");

    if (!user?.passwordHash) throw invalid;
    if (!(await verifyPassword(user.passwordHash, password))) throw invalid;

    clearRateLimit(limitKey);
    await createSession(user.id, meta);

    const membership = await db.membership.findFirst({
      where: { userId: user.id, archivedAt: null, org: { archivedAt: null } },
      include: { org: { select: { slug: true } } },
      orderBy: { createdAt: "asc" },
    });

    return { ok: true, data: { slug: membership?.org.slug ?? null } };
  } catch (error) {
    return toActionError(error);
  }
}

// ── CIERRE DE SESIÓN ──────────────────────────────────────────────

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
