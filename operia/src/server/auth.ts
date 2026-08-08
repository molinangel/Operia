import { hash, verify } from "@node-rs/argon2";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import { db } from "./db";
import { UnauthorizedError, ValidationError } from "./errors";

/**
 * Autenticación por sesión en base de datos.
 *
 * Se implementa a mano en lugar de usar una librería porque son unas 120 líneas
 * bajo nuestro control total, sin quedar atados a la compatibilidad de un
 * paquete de terceros con cada versión nueva de Next.js. La sesión en base de
 * datos además permite revocarla de verdad, cosa que un JWT no.
 */

const COOKIE_NAME = "operia_session";
const SESSION_DAYS = 30;

/** Parámetros de argon2id recomendados por OWASP para uso interactivo. */
const ARGON_OPTIONS = {
  memoryCost: 19456, // 19 MiB
  timeCost: 2,
  parallelism: 1,
} as const;

export function hashPassword(password: string) {
  return hash(password, ARGON_OPTIONS);
}

export async function verifyPassword(hashed: string, password: string) {
  try {
    return await verify(hashed, password, ARGON_OPTIONS);
  } catch {
    return false;
  }
}

export function generateToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export function assertPasswordStrength(password: string) {
  if (password.length < 8) {
    throw new ValidationError("La contraseña debe tener al menos 8 caracteres.", {
      password: "Mínimo 8 caracteres.",
    });
  }
  if (password.length > 200) {
    throw new ValidationError("La contraseña es demasiado larga.");
  }
}

// ── Sesiones ──────────────────────────────────────────────────────

export async function createSession(
  userId: string,
  meta?: { ip?: string; userAgent?: string },
) {
  const sessionToken = generateToken();
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);

  await db.session.create({
    data: { sessionToken, userId, expires, ip: meta?.ip, userAgent: meta?.userAgent },
  });

  const store = await cookies();
  store.set(COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });

  await db.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;

  if (token) {
    await db.session.deleteMany({ where: { sessionToken: token } });
  }
  store.delete(COOKIE_NAME);
}

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
};

/**
 * `cache` de React deduplica la consulta dentro de una misma petición: aunque
 * diez componentes pregunten quién es el usuario, se consulta una sola vez.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { sessionToken: token },
    include: {
      user: { select: { id: true, email: true, name: true, image: true } },
    },
  });

  if (!session) return null;

  if (session.expires < new Date()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return session.user;
});

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

// ── Tokens de verificación (email y recuperación de clave) ────────

export async function createVerificationToken(
  identifier: string,
  purpose: "email_verify" | "password_reset",
  ttlMinutes = 60,
) {
  // Un pedido nuevo invalida los anteriores del mismo tipo.
  await db.verificationToken.deleteMany({ where: { identifier, purpose } });

  const token = generateToken();
  await db.verificationToken.create({
    data: {
      identifier,
      token,
      purpose,
      expires: new Date(Date.now() + ttlMinutes * 60_000),
    },
  });
  return token;
}

export async function consumeVerificationToken(token: string, purpose: string) {
  const record = await db.verificationToken.findUnique({ where: { token } });

  if (!record || record.purpose !== purpose || record.usedAt) return null;
  if (record.expires < new Date()) return null;

  await db.verificationToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return record.identifier;
}

// ── Limitación de intentos ────────────────────────────────────────

/**
 * Límite en memoria. Suficiente hasta que haya varias instancias del servidor;
 * llegado ese punto se mueve a la base de datos. Documentado para no olvidarlo.
 */
const attempts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, max = 8, windowMs = 600_000) {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;

  entry.count += 1;
  return true;
}

export function clearRateLimit(key: string) {
  attempts.delete(key);
}
